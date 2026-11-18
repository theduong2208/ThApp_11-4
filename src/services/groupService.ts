import {
  ref,
  push,
  update,
  onValue,
  serverTimestamp,
  increment,
  get,
} from 'firebase/database';
import { db } from './firebase';
import { ConversationMeta } from '../types/models';

// Tạo nhóm chat mới (Atomic multi-path update)
export async function createGroup(
  name: string,
  creatorUid: string,
  creatorName: string,
  memberUids: string[]
): Promise<string> {
  const trimmedName = name.trim();
  const convRef = push(ref(db, 'conversations'));
  const convId = convRef.key;
  if (!convId) throw new Error('Không thể tạo mã cuộc trò chuyện.');

  // Tạo danh sách thành viên gồm người tạo và các thành viên được chọn
  const allMembers: Record<string, boolean> = { [creatorUid]: true };
  memberUids.forEach((uid) => {
    allMembers[uid] = true;
  });

  const nowTimestamp = serverTimestamp();
  const updates: Record<string, unknown> = {};

  // 1. Ghi thông tin nhóm vào conversations/{convId}
  updates[`conversations/${convId}`] = {
    id: convId,
    type: 'group',
    name: trimmedName,
    members: allMembers,
    createdBy: creatorUid,
    createdAt: nowTimestamp,
  };

  // 2. Thêm tin nhắn hệ thống đầu tiên
  const sysMsgRef = push(ref(db, `messages/${convId}`));
  const sysMsgId = sysMsgRef.key;
  if (sysMsgId) {
    updates[`messages/${convId}/${sysMsgId}`] = {
      id: sysMsgId,
      convId,
      senderId: creatorUid,
      senderName: 'Hệ thống',
      type: 'system',
      text: `${creatorName} đã tạo nhóm "${trimmedName}"`,
      createdAt: nowTimestamp,
    };
  }

  // 3. Cập nhật userChats cho tất cả thành viên trong nhóm
  Object.keys(allMembers).forEach((mUid) => {
    updates[`userChats/${mUid}/${convId}`] = {
      convId,
      type: 'group',
      name: trimmedName,
      lastMessage: `${creatorName} đã tạo nhóm`,
      lastMessageType: 'system',
      lastSenderId: creatorUid,
      updatedAt: nowTimestamp,
      unread: mUid === creatorUid ? 0 : 1,
      members: allMembers,
    };

    // 4. Tạo thông báo "Bạn được thêm vào nhóm" cho các thành viên khác
    if (mUid !== creatorUid && sysMsgId) {
      updates[`notifications/${mUid}/${convId}_joined`] = {
        id: `${convId}_joined`,
        type: 'added_to_group',
        convId,
        fromUid: creatorUid,
        fromName: creatorName,
        text: `Bạn đã được ${creatorName} thêm vào nhóm "${trimmedName}"`,
        createdAt: nowTimestamp,
        read: false,
      };
    }
  });

  await update(ref(db), updates);
  return convId;
}

// Lắng nghe chi tiết thông tin cuộc trò chuyện / nhóm
export function subscribeConversation(
  convId: string,
  callback: (conv: ConversationMeta | null) => void
): () => void {
  const convRef = ref(db, `conversations/${convId}`);

  const unsubscribe = onValue(convRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const data = snapshot.val() as Record<string, unknown>;
    callback({
      id: convId,
      type: data.type === 'group' ? 'group' : 'direct',
      name: typeof data.name === 'string' ? data.name : 'Cuộc trò chuyện',
      avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : undefined,
      members: (data.members as Record<string, boolean>) || {},
      createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
      createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
    });
  });

  return unsubscribe;
}

// Đổi tên nhóm (Phần C nâng cao)
export async function updateGroupName(
  convId: string,
  newName: string,
  updaterId: string,
  updaterName: string
): Promise<void> {
  const trimmed = newName.trim();
  if (!trimmed) return;

  const convSnap = await get(ref(db, `conversations/${convId}`));
  if (!convSnap.exists()) return;
  const convData = convSnap.val() as { members?: Record<string, boolean> };
  const members = convData.members || {};

  const nowTimestamp = serverTimestamp();
  const updates: Record<string, unknown> = {};

  updates[`conversations/${convId}/name`] = trimmed;

  // Tin nhắn hệ thống
  const sysMsgRef = push(ref(db, `messages/${convId}`));
  const sysMsgId = sysMsgRef.key;
  if (sysMsgId) {
    updates[`messages/${convId}/${sysMsgId}`] = {
      id: sysMsgId,
      convId,
      senderId: updaterId,
      senderName: 'Hệ thống',
      type: 'system',
      text: `${updaterName} đã đổi tên nhóm thành "${trimmed}"`,
      createdAt: nowTimestamp,
    };
  }

  // Cập nhật tên nhóm ở userChats của tất cả thành viên
  Object.keys(members).forEach((mUid) => {
    updates[`userChats/${mUid}/${convId}/name`] = trimmed;
    updates[`userChats/${mUid}/${convId}/lastMessage`] = `${updaterName} đã đổi tên nhóm`;
    updates[`userChats/${mUid}/${convId}/updatedAt`] = nowTimestamp;
  });

  await update(ref(db), updates);
}

// Thêm thành viên vào nhóm (Phần C nâng cao)
export async function addMembersToGroup(
  convId: string,
  groupName: string,
  newMemberUids: string[],
  adderId: string,
  adderName: string
): Promise<void> {
  const convSnap = await get(ref(db, `conversations/${convId}`));
  if (!convSnap.exists()) return;
  const convData = convSnap.val() as { members?: Record<string, boolean> };
  const currentMembers = { ...(convData.members || {}) };

  const nowTimestamp = serverTimestamp();
  const updates: Record<string, unknown> = {};

  newMemberUids.forEach((uid) => {
    currentMembers[uid] = true;
    updates[`conversations/${convId}/members/${uid}`] = true;
    updates[`userChats/${uid}/${convId}`] = {
      convId,
      type: 'group',
      name: groupName,
      lastMessage: `${adderName} đã thêm bạn vào nhóm`,
      lastMessageType: 'system',
      lastSenderId: adderId,
      updatedAt: nowTimestamp,
      unread: 1,
      members: currentMembers,
    };

    updates[`notifications/${uid}/${convId}_added_${Date.now()}`] = {
      id: `${convId}_added_${Date.now()}`,
      type: 'added_to_group',
      convId,
      fromUid: adderId,
      fromName: adderName,
      text: `${adderName} đã thêm bạn vào nhóm "${groupName}"`,
      createdAt: nowTimestamp,
      read: false,
    };
  });

  // Ghi tin hệ thống
  const sysMsgRef = push(ref(db, `messages/${convId}`));
  const sysMsgId = sysMsgRef.key;
  if (sysMsgId) {
    updates[`messages/${convId}/${sysMsgId}`] = {
      id: sysMsgId,
      convId,
      senderId: adderId,
      senderName: 'Hệ thống',
      type: 'system',
      text: `${adderName} đã thêm thành viên mới vào nhóm`,
      createdAt: nowTimestamp,
    };
  }

  // Cập nhật lại danh sách members trong userChats của toàn bộ thành viên
  Object.keys(currentMembers).forEach((mUid) => {
    updates[`userChats/${mUid}/${convId}/members`] = currentMembers;
  });

  await update(ref(db), updates);
}

// Rời nhóm (Phần C nâng cao)
export async function leaveGroup(
  convId: string,
  memberUid: string,
  memberName: string
): Promise<void> {
  const convSnap = await get(ref(db, `conversations/${convId}`));
  if (!convSnap.exists()) return;
  const convData = convSnap.val() as { members?: Record<string, boolean> };
  const members = { ...(convData.members || {}) };
  delete members[memberUid];

  const nowTimestamp = serverTimestamp();
  const updates: Record<string, unknown> = {};

  // Xóa khỏi conversations và userChats của thành viên đó
  updates[`conversations/${convId}/members/${memberUid}`] = null;
  updates[`userChats/${memberUid}/${convId}`] = null;

  // Ghi tin nhắn hệ thống "A đã rời nhóm"
  const sysMsgRef = push(ref(db, `messages/${convId}`));
  const sysMsgId = sysMsgRef.key;
  if (sysMsgId) {
    updates[`messages/${convId}/${sysMsgId}`] = {
      id: sysMsgId,
      convId,
      senderId: memberUid,
      senderName: 'Hệ thống',
      type: 'system',
      text: `${memberName} đã rời khỏi nhóm`,
      createdAt: nowTimestamp,
    };
  }

  // Cập nhật lại danh sách members cho các thành viên còn lại
  Object.keys(members).forEach((mUid) => {
    updates[`userChats/${mUid}/${convId}/members`] = members;
    updates[`userChats/${mUid}/${convId}/lastMessage`] = `${memberName} đã rời nhóm`;
    updates[`userChats/${mUid}/${convId}/updatedAt`] = nowTimestamp;
  });

  await update(ref(db), updates);
}


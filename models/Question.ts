import { Timestamp } from 'firebase/firestore';

export type Question = {
  id: string;
  senderUid: string;
  receiverUid: string;
  body: string;
  isReplied: boolean;
  createdAt: Timestamp;
};

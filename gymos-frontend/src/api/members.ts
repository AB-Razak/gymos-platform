import { apiRequest } from "./client";
import type { Member, MemberPayload } from "../types";

export const membersApi = {
  list: () =>
    apiRequest<Member[]>("/members", {
      workspace: true,
    }),

  create: (payload: MemberPayload) =>
    apiRequest<Member>("/members", {
      method: "POST",
      body: JSON.stringify(payload),
      workspace: true,
    }),
};
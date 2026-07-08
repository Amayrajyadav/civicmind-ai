import api from "./api";

export interface IssueSubmitResponse {
  issue_id: string;
  status: string;
  message: string;
}

export interface ProcessingStatusResponse {
  issue_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message: string;
  updated_at: string;
}

export const issueService = {
  submitIssue: async (formData: FormData): Promise<IssueSubmitResponse> => {
    const response = await api.post<IssueSubmitResponse>("/submit-issue", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getProcessingStatus: async (issueId: string): Promise<ProcessingStatusResponse> => {
    const response = await api.get<ProcessingStatusResponse>(`/processing/${issueId}`);
    return response.data;
  },
};

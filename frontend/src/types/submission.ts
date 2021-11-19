export  interface Submission {
    id?: string;
    parentId: "" | null,
    project: string;
    created: Date;
    updated: Date;
    title: string;
    status: string;
    author: string;
    data: any;
  }

  export interface SubmissionWithChildren {
    submission: Submission,
    children: Submission[];
  }
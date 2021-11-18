export default interface Submission {
    id?: string;
    project: string;
    created: Date;
    updated: Date;
    title: string;
    status: string;
    author: string;
    data: any;
    // children: string[];
    [key: string]: any
  }
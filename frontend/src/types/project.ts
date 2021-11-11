export default interface Project {
    id?: string;
    created: Date;
    updated: Date;
    title: string;
    author: string;
    description: string;
    defaultStatus: string;
    tags: string[];
    roles: string[];
    components: any;
  }
  
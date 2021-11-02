export default interface Project {
    id?: string;
    created: Date;
    updated: Date;
    title: string;
    author: string;
    description: string;
    tags: string[];
    roles: string[];
    components: any;
  }
  
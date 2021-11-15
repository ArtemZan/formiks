export default interface Dropdown {
    id?: string;
    created: Date;
    title: string;
    description: string;
    type: string;
    url: string;
    processor: string;
    values: any[];
    syncInterval: number;
    lastSync: Date;
    private: boolean;
  }
  
import axios, { AxiosResponse } from "axios";
import Project from "../../types/project";

export class API {
  public baseUrl =
    process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:8000/api";
  public usersUrl = `${this.baseUrl}/users/`;
  public projectsUrl = `${this.baseUrl}/projects/`;

  getRoles(): Promise<AxiosResponse<string[]>> {
    return axios.get(`${this.usersUrl}roles`);
  }
  getProjects(): Promise<AxiosResponse<Project[]>> {
    return axios.get<Project[]>(this.projectsUrl);
  }
  getProject(id: string): Promise<AxiosResponse<Project>> {
    return axios.get<Project>(`${this.projectsUrl}${id}`);
  }
  createProject(project: Project): Promise<AxiosResponse<Project>> {
    return axios.post<Project>(`${this.projectsUrl}`, JSON.stringify(project));
  }
  updateProject(project: Project): Promise<AxiosResponse> {
    return axios.put<Project>(
      `${this.projectsUrl}${project.id}`,
      JSON.stringify(project)
    );
  }
  deleteProject(id: string): Promise<AxiosResponse> {
    return axios.delete(`${this.projectsUrl}${id}`);
  }

  getEntityIdFromUrl(url: string): number {
    const urlSegments = url.split("/").filter((x) => x !== "");
    return parseInt(urlSegments[urlSegments.length - 1]);
  }
}

export const RestAPI = new API();

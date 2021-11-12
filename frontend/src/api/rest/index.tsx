import axios, { AxiosResponse } from "axios";
import Bookmark from "../../types/bookmark";
import Project from "../../types/project";
import Submission from "../../types/submission";

export class API {
  public baseUrl =
    process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:8000/api";
  public usersUrl = `${this.baseUrl}/users/`;
  public projectsUrl = `${this.baseUrl}/projects/`;
  public bookmarksUrl = `${this.baseUrl}/bookmarks/`;
  public submissionsUrl = `${this.baseUrl}/submissions/`;

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

  getBookmarks(): Promise<AxiosResponse<Bookmark[]>> {
    return axios.get<Bookmark[]>(this.bookmarksUrl);
  }
  createBookmark(bookmark: Bookmark): Promise<AxiosResponse<Bookmark>> {
    return axios.post<Bookmark>(this.bookmarksUrl, JSON.stringify(bookmark));
  }
  deleteBookmark(id: string): Promise<AxiosResponse> {
    return axios.delete(`${this.bookmarksUrl}${id}`);
  }

  getSubmissions(project?: string): Promise<AxiosResponse<Submission[]>> {
    return axios.get<Submission[]>(this.submissionsUrl);
  }
  getSubmission(id: string): Promise<AxiosResponse<Submission>> {
    return axios.get<Submission>(`${this.submissionsUrl}${id}`);
  }
  createSubmission(submission: Submission): Promise<AxiosResponse<Submission>> {
    return axios.post<Submission>(
      `${this.submissionsUrl}`,
      JSON.stringify(submission)
    );
  }
  updateSubmission(submission: Submission): Promise<AxiosResponse> {
    return axios.put<Submission>(
      `${this.submissionsUrl}${submission.id}`,
      JSON.stringify(submission)
    );
  }
  deleteSubmission(id: string): Promise<AxiosResponse> {
    return axios.delete(`${this.submissionsUrl}${id}`);
  }

  getEntityIdFromUrl(url: string): number {
    const urlSegments = url.split("/").filter((x) => x !== "");
    return parseInt(urlSegments[urlSegments.length - 1]);
  }
}

export const RestAPI = new API();

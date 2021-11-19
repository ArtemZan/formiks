import axios, { AxiosResponse } from "axios";
import Bookmark from "../../types/bookmark";
import Dropdown from "../../types/dropdown";
import Project from "../../types/project";
import { Submission, SubmissionWithChildren } from "../../types/submission";

export class API {
  public baseUrl =
    process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:8000/api";
  public usersUrl = `${this.baseUrl}/users/`;
  public projectsUrl = `${this.baseUrl}/projects/`;
  public bookmarksUrl = `${this.baseUrl}/bookmarks/`;
  public submissionsUrl = `${this.baseUrl}/submissions/`;
  public dropdownsUrl = `${this.baseUrl}/dropdowns/`;

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
    const params = new URLSearchParams([]);
    if (project) {
      params.set("project", project);
    }
    return axios.get<Submission[]>(this.submissionsUrl, { params });
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
  createSubmissionWithChildren(
    submission: SubmissionWithChildren
  ): Promise<AxiosResponse> {
    return axios.post(
      `${this.submissionsUrl}children`,
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

  getDropdowns(): Promise<AxiosResponse<Dropdown[]>> {
    return axios.get<Dropdown[]>(this.dropdownsUrl);
  }
  getDropdown(id: string): Promise<AxiosResponse<Dropdown>> {
    return axios.get<Dropdown>(`${this.dropdownsUrl}${id}`);
  }
  syncDropdown(id: string): Promise<AxiosResponse> {
    return axios.get(`${this.dropdownsUrl}sync/${id}`);
  }
  createDropdown(dropdown: Dropdown): Promise<AxiosResponse<Dropdown>> {
    return axios.post<Dropdown>(
      `${this.dropdownsUrl}`,
      JSON.stringify(dropdown)
    );
  }
  updateDropdown(dropdown: Dropdown): Promise<AxiosResponse> {
    return axios.put<Dropdown>(
      `${this.dropdownsUrl}${dropdown.id}`,
      JSON.stringify(dropdown)
    );
  }
  deleteDropdown(id: string): Promise<AxiosResponse> {
    return axios.delete(`${this.dropdownsUrl}${id}`);
  }

  getEntityIdFromUrl(url: string): number {
    const urlSegments = url.split("/").filter((x) => x !== "");
    return parseInt(urlSegments[urlSegments.length - 1]);
  }
}

export const RestAPI = new API();

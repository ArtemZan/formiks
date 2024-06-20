import axios, { AxiosResponse } from "axios";
import Bookmark from "../../types/bookmark";
import Dropdown from "../../types/dropdown";
import Project from "../../types/project";
import {
  PAreport,
  Submission,
  SubmissionWithChildren,
} from "../../types/submission";
import { Template } from "../../types/template";

export class API {
  // public baseUrl =
  //   process.env.NODE_ENV === "production"
  //     ? "/api"
  //     : "http://localhost:7000/api";
  public baseUrl = 'https://mato.root.local/api';
  public usersUrl = `${this.baseUrl}/users/`;
  public projectsUrl = `${this.baseUrl}/projects/`;
  public bookmarksUrl = `${this.baseUrl}/bookmarks/`;
  public submissionsUrl = `${this.baseUrl}/submissions/`;
  public paReport = `${this.baseUrl}/reports/`;
  public dropdownsUrl = `${this.baseUrl}/dropdowns/`;
  public templatesUrl = `${this.baseUrl}/templates/`;
  public draftsUrl = `${this.baseUrl}/drafts/`;
  public viewsUrl = `${this.baseUrl}/views/`;

  getRolesAD(account: any): Promise<AxiosResponse<string[]>> {
    return axios.get(`${this.usersUrl}rolesAD`);
  }

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
  getSubmissionWithChildren(
    id: string
  ): Promise<AxiosResponse<SubmissionWithChildren>> {
    return axios.get<SubmissionWithChildren>(`${this.submissionsUrl}${id}`);
  }

  getSubmissionWithChildrenByProject(
    number: string
  ): Promise<AxiosResponse<SubmissionWithChildren>> {
    return axios.get<SubmissionWithChildren>(
      `${this.submissionsUrl}project/${number}`
    );
  }

  getPAreport(): Promise<AxiosResponse<PAreport[]>> {
    return axios.get<PAreport[]>(this.paReport);
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
  updateSubmissionPartial(
    submission: string,
    path: string,
    value: any
  ): Promise<AxiosResponse> {
    return axios.post(
      `${this.submissionsUrl}partial`,
      JSON.stringify({
        submission,
        path,
        value,
      })
    );
  }
  callSapSubmission(submission: string): Promise<AxiosResponse> {
    return axios.get(`${this.submissionsUrl}${submission}/sap`);
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
  getDropdownValues(id: string): Promise<AxiosResponse<any[]>> {
    return axios.get<any[]>(`${this.dropdownsUrl}${id}/values`);
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

  getVendorTableDefaultConfig(): Promise<AxiosResponse<any>> {
    return axios.get<any>(`${this.submissionsUrl}vendorTable`);
  }

  getTemplates(): Promise<AxiosResponse<Template[]>> {
    return axios.get<Template[]>(this.templatesUrl);
  }
  updateTemplate(template: Template): Promise<AxiosResponse> {
    return axios.put<Template>(
      `${this.templatesUrl}${template.name}`,
      JSON.stringify(template)
    );
  }

  getDrafts(): Promise<AxiosResponse<Submission[]>> {
    return axios.get<Submission[]>(this.draftsUrl);
  }
  getDraft(id: string): Promise<AxiosResponse<SubmissionWithChildren>> {
    return axios.get<SubmissionWithChildren>(`${this.draftsUrl}${id}`);
  }
  createDraft(
    draft: SubmissionWithChildren
  ): Promise<AxiosResponse<SubmissionWithChildren>> {
    return axios.post<SubmissionWithChildren>(
      `${this.draftsUrl}`,
      JSON.stringify(draft)
    );
  }
  updateDraft(draft: SubmissionWithChildren): Promise<AxiosResponse> {
    return axios.put<SubmissionWithChildren>(
      `${this.draftsUrl}${draft.submission.id}`,
      JSON.stringify(draft)
    );
  }
  deleteDraft(id: string): Promise<AxiosResponse> {
    return axios.delete(`${this.draftsUrl}${id}`);
  }

  getView(id: string): Promise<AxiosResponse<SubmissionWithChildren>> {
    return axios.get<SubmissionWithChildren>(`${this.viewsUrl}${id}`);
  }

  updateVendorTableDefaultConfig(
    displayedColumns: string[],
    columnsWidth: any
  ): Promise<AxiosResponse> {
    return axios.put<any>(
      `${this.submissionsUrl}vendorTable`,
      JSON.stringify({
        displayedColumns: displayedColumns,
        columnsWidth: columnsWidth,
      })
    );
  }

  getEntityIdFromUrl(url: string): number {
    const urlSegments = url.split("/").filter((x) => x !== "");
    return parseInt(urlSegments[urlSegments.length - 1]);
  }
}

export const RestAPI = new API();

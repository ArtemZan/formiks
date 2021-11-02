import axios, { AxiosResponse } from "axios";

export class ServerApi {
  public baseUrl =
    process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:8000/api";
  public userUrl = `${this.baseUrl}/users`;

  getRoles(): Promise<AxiosResponse<string[]>> {
    return axios.get(`${this.userUrl}/roles`);
  }

  //   getApplications(teams?: string[]): Promise<AxiosResponse<Application[]>> {
  //     return axios.get<Application[]>(`${this.applicationsUrl}`, {
  //       params: { teams: teams?.join() },
  //     });
  //   }

  //   getApplication(id: string): Promise<AxiosResponse<Application>> {
  //     return axios.get<Application>(`${this.applicationsUrl}${id}`);
  //   }
  //   createApplication(
  //     application: Application
  //   ): Promise<AxiosResponse<Application>> {
  //     return axios.post<Application>(
  //       `${this.applicationsUrl}`,
  //       JSON.stringify(application)
  //     );
  //   }
  //   updateApplication(
  //     application: Application
  //   ): Promise<AxiosResponse<Application>> {
  //     return axios.put<Application>(
  //       `${this.applicationsUrl}${application.id}`,
  //       JSON.stringify(application)
  //     );
  //   }
  //   deleteApplication(id: string): Promise<AxiosResponse> {
  //     return axios.delete(`${this.applicationsUrl}${id}`);
  //   }

  getEntityIdFromUrl(url: string): number {
    const urlSegments = url.split("/").filter((x) => x !== "");
    return parseInt(urlSegments[urlSegments.length - 1]);
  }
}

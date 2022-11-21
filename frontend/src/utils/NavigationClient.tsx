import { NavigationClient, NavigationOptions } from "@azure/msal-browser";
import { History } from "history";

export class CustomNavigationClient extends NavigationClient {
  private history: History;

  constructor(history: History) {
    super();
    this.history = history;
  }

  async navigateInternal(url: string, options: NavigationOptions) {
    const relativePath = url.replace(window.location.origin, "");
    if (options.noHistory) {
      this.history.replace(relativePath);
    } else {
      this.history.push(relativePath);
    }

    return false;
  }
}

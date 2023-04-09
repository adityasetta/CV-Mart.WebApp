import { Injectable } from "@angular/core";
import { compact, fromPairs } from 'lodash-es';
import { MockApiHandler } from "./mock-api.handler";
import { MockApiMethods } from "./mock-api.types";

@Injectable({
  providedIn: 'root'
})
export class MockApiService
{
  private handlers: { [key: string]: Map<string, MockApiHandler> } = {
      'get'    : new Map<string, MockApiHandler>(),
      'post'   : new Map<string, MockApiHandler>(),
      'patch'  : new Map<string, MockApiHandler>(),
      'delete' : new Map<string, MockApiHandler>(),
      'put'    : new Map<string, MockApiHandler>()
  };

  constructor() { }

  public findRequestHandler(method: string, url: string): { handler: MockApiHandler | undefined; urlParams: { [key: string]: string } }
  {
      const matchingHandler: { handler: MockApiHandler | undefined; urlParams: { [key: string]: string } } = {
          handler  : undefined,
          urlParams: {}
      };

      const urlParts = url.split(/\/|\?/);

      const handlers = this.handlers[method.toLowerCase()];

      handlers.forEach((handler, handlerUrl) => {
          if ( matchingHandler.handler )
          {
              return;
          }

          const handlerUrlParts = handlerUrl.split('/');

          if ( urlParts.length < handlerUrlParts.length )
          {
              return;
          }

          if(urlParts.length > handlerUrlParts.length) {
              const matches = handlerUrlParts.every((handlerUrlPart, index) => handlerUrlPart === urlParts[index]);

              if ( matches )
              {
                  let urlParams = {};
                  const urlPartParams = urlParts.filter(part => !handlerUrlParts.includes(part));
                  urlPartParams?.forEach((value, index) => {
                      const keyName: string = 'param' + (index+1).toString();
                      urlParams = { [keyName] : value };
                  });
                  matchingHandler.handler = handler;
                  matchingHandler.urlParams = urlParams;
              }
          }
          else {
              const matches = handlerUrlParts.every((handlerUrlPart, index) => handlerUrlPart === urlParts[index] || handlerUrlPart.startsWith(':'));

              if ( matches )
              {
                  matchingHandler.handler = handler;

                  matchingHandler.urlParams = fromPairs(compact(handlerUrlParts.map((handlerUrlPart, index) =>
                      handlerUrlPart.startsWith(':') ? [handlerUrlPart.substring(1), urlParts[index]] : undefined
                  )));
              }
          }
      });

      return matchingHandler;
  }

  public onGetRequest(url: string, loadTime?: number): MockApiHandler
  {
      return this.registerHandler('get', url, loadTime);
  }

  public onPostRequest(url: string, loadTime?: number): MockApiHandler
  {
      return this.registerHandler('post', url, loadTime);
  }

  public onPatchRequest(url: string, loadTime?: number): MockApiHandler
  {
      return this.registerHandler('patch', url, loadTime);
  }

  public onDeleteRequest(url: string, loadTime?: number): MockApiHandler
  {
      return this.registerHandler('delete', url, loadTime);
  }

  public onPutRequest(url: string, loadTime?: number): MockApiHandler
  {
      return this.registerHandler('put', url, loadTime);
  }

  private registerHandler(method: MockApiMethods, url: string, loadTime?: number): MockApiHandler
  {
      const MockHttp = new MockApiHandler(url, loadTime);
      this.handlers[method].set(url, MockHttp);

      return MockHttp;
  }
}

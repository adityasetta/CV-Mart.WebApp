import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule, ModuleWithProviders, APP_INITIALIZER } from "@angular/core";
import { MockApiInterceptor } from "./mock-api.interceptor";

@NgModule({
  providers: [
      {
          provide : HTTP_INTERCEPTORS,
          useClass: MockApiInterceptor,
          multi   : true
      }
  ]
})
export class MockApiModule
{
  static forRoot(mockApiServices: any[]): ModuleWithProviders<MockApiModule> {
      return {ngModule : MockApiModule,
              providers: [
                  {
                      provide   : APP_INITIALIZER,
                      deps      : [...mockApiServices],
                      useFactory: () => (): any => null,
                      multi     : true
                  }
              ]};
  }
}

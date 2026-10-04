import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { assetsFromDiskInterceptor } from './assets-from-disk.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // Au prérendu il n'existe aucun serveur HTTP à interroger, donc les requêtes
    // vers assets/** sont servies depuis le disque. Sans ça les pages prérendues
    // ne contiennent que la coquille, sans le texte des articles.
    provideHttpClient(withFetch(), withInterceptors([assetsFromDiskInterceptor])),
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);

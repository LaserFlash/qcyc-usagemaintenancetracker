import { Component, OnInit, HostBinding } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { ThemeTrackerService } from './core/theme/theme-tracker.service';
import { AuthenticationService } from './core/auth/authentication.service';

import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { title as siteTitle } from '../environments/environment';
import { versionInfo } from '../version'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  viewProviders: [MatIconRegistry]
})
export class AppComponent implements OnInit {
  title = siteTitle;
  build: string;
  currentDate = new Date();
  isDarkTheme: boolean;
  public themeBackground = "#eceff1";
  isAdmin: boolean;
  routeLinks = [
    { label: 'Report', link: 'report', name: 'report' },
    { label: 'View', link: 'view', name: 'view' },
    { label: 'Docs', link: 'docs', name: 'docs' },
  ];

  adminLink = { label: 'Admin Panel', link: 'admin' };

  @HostBinding('attr.style')
  public get valueAsStyle(): any {
    return this.sanitizer.bypassSecurityTrustStyle(`--bg-colour: ${this.themeBackground}`);
  }


  constructor(
    private themeTracker: ThemeTrackerService,
    private router: Router, iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    public AUTH: AuthenticationService
  ) {
    /* Apply theme at start */
    this.themeTracker.isDark.subscribe(dark => {
      this.isDarkTheme = dark;
    });

    this.setBackground();

    iconRegistry.addSvgIcon('docs',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-document.svg'))
      .addSvgIcon('report',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/clipboard-outline.svg'))
      .addSvgIcon('view',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/view-stream.svg'));

    AUTH.isAdmin.subscribe(value => {
      this.isAdmin = value;
    });

    versionInfo.then(version => this.build = version);
  }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      const element = document.getElementById('scrollId');
      setTimeout(function () {
        element.scrollIntoView();
        window.scrollTo(0, 0);
      }, 1);
    });
  }

  /** Change state of dark theme, updating cookie */
  public toggleDark() {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeTracker.setDark(this.isDarkTheme);

    this.setBackground();
  }

  private setBackground() {
    if (this.isDarkTheme) {
      this.themeBackground = '#212121';
    } else {
      this.themeBackground = '#eceff1';
    }
  }


  public getRouteLink(linkSuffix: string) {
    return linkSuffix + '/' + this.getSubRoute();
  }

  private getSubRoute() {
    return this.router.url.split('/')[2];
  }

  public checkActive(link) {
    return this.router.url.split('/')[1] === link;
  }
  public print() {
    window.print();
  }
}

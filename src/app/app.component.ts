import { NavigationEnd, Router } from '@angular/router';
import { Component } from '@angular/core';
import { Store } from "@ngrx/store";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private router: Router,
    private store: Store<{ titleHeader: string }>,
    private title: Title,
  ) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        var myTitle = this.getTitle(
          router.routerState,
          router.routerState.root
        ).join("-");
        title.setTitle(myTitle);
      }
    });
  }

  getTitle(state: any, parent: any): any {
    const data: string[] = [];
    if (parent && parent.snapshot.data && parent.snapshot.data.title) {
      // this.store.dispatch(
      //   setTitleHeader({
      //     view: parent.snapshot.data.header,
      //   })
      // );
      data.push(parent?.snapshot?.data?.title);
    }

    if (state && parent) {
      data.push(...this.getTitle(state, state.firstChild(parent)));
    }

    return data;
  }
}

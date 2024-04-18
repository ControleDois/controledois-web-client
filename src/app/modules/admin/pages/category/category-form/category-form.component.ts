import {Component, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {catchError, finalize, map} from "rxjs/operators";
import {throwError} from "rxjs";
import { CategoryService } from 'src/app/shared/services/category.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SearchLoadingUnique } from 'src/app/shared/widget/search-loading-unique/search-loading-unique.interface';
import { LoadingFull } from 'src/app/shared/interfaces/loadingFull.interface';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent implements OnInit {
  private formId: string;

  public loadingFull: LoadingFull = {
    active: false,
    message: 'Aguarde, carregando...'
  }
  public myForm: FormGroup = new FormGroup({
    category_id: new FormControl(''),
    role: new FormControl(0, Validators.required),
    name: new FormControl('', Validators.required),
  });

  public roles = [{ name: '⦿ Despesa', type: 0 }, { name: '⦿ Receita', type: 1 }];

  @Output() searchCategory: SearchLoadingUnique = {
    noTitle: false,
    title: 'Aparecer dentro de',
    url: 'category',
    searchFieldOn: null,
    searchFieldOnCollum: 'name',
    sortedBy: 'name',
    orderBy: 'name',
    searchField: new FormControl(''),
    paramsArray: [
      {
        param: 'role',
        value: 0
      }
    ],
    validation: false
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.formId !== 'new') {
      this.loadingFull.active = true;
      this.categoryService.show(this.formId).pipe(
        finalize(() => this.loadingFull.active = false),
        catchError((error) => {
          this.notificationService.warn('Dados não encontrados...');
          this.router.navigate(['category']);
          return throwError(error);
        }),
        map((res) => {
          this.setForm(res);
        })
      ).subscribe();
    }
  }

  setForm(value: any): void {
    if (value) {
      this.myForm.patchValue(value);

      this.searchCategory.searchFieldOn = value?.category;
      this.searchCategory.searchField.setValue(value?.category?.name);
    }
  }

  save(): void {
    this.loadingFull.active = true;

    this.myForm.value.category_id = this.searchCategory?.searchFieldOn?.id;

    this.categoryService.save(this.formId, this.myForm.value).pipe(
      finalize(() => this.loadingFull.active = false),
      catchError((error) => {
        this.notificationService.warn(error.error);
        return throwError(error);
      }),
      map(() => {
        this.notificationService.success('Salvo com sucesso.');
        this.router.navigate(['category']);
      })
    ).subscribe();
  }

  getRole(): void {
    this.searchCategory.searchFieldOn = null;
    this.searchCategory.searchField.setValue('');
    this.searchCategory.paramsArray = [
      {
        param: 'role',
        value: this.myForm.value.role
      }
    ];
  }
}

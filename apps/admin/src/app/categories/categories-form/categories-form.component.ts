import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriesService, Category } from '@frontend/products';
import { MessageService } from 'primeng/api';
import { timer } from 'rxjs/internal/observable/timer';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'admin-categories-form',
  templateUrl: './categories-form.component.html',
  styles: [
  ]
})
export class CategoriesFormComponent implements OnInit {
  form: FormGroup;
  isSubmitted = false;
  editMode = false;
  currCategoryId: string;

  constructor(
    private formBuilder: FormBuilder,
    private catServices: CategoriesService,
    private messageService: MessageService,
    private location: Location,
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      icon: ['', Validators.required],
      color: ['#ffff2']
    });

    this.checkIfEditMode();
  }

  onSubmit() {
    this.isSubmitted = true;
    if(this.form.invalid) {
      return;
    }

    const category: Category = {
      id: this.currCategoryId,
      name: this.form.controls.name.value,
      icon: this.form.controls.icon.value,
      color: this.form.controls.color.value
    }

    if (this.editMode) {
      this.updateCategory(category);
    } else {
      this.addCategory(category);
    }
  }

  onCancel() {
    this.location.back();
  }

  private addCategory(category: Category) {
    this.catServices.createCategory(category).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Category created'
        });
        timer(2000).toPromise().then(() => {
          this.location.back();
        });
      },
      () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Category is not created'
        });
      }
    );
  }

  private updateCategory(category: Category) {
    this.catServices.updateCategory(category).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Category updated'
        });
        timer(2000).toPromise().then(() => {
          this.location.back();
        });
      },
      () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Category is not updated'
        });
      }
    );
  }

  private checkIfEditMode() {
    this.route.params.subscribe((params) => {
      if (params.id) {
        this.editMode = true;
        this.currCategoryId = params.id;
        this.catServices.getCategory(params.id).subscribe((cat) => {
          this.form.controls.name.setValue(cat.name);
          this.form.controls.icon.setValue(cat.icon);
          this.form.controls.color.setValue(cat.color);
        })
      }
    });
  }
}

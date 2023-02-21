import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriesService, ProductsService } from '@frontend/products';
import { MessageService } from 'primeng/api';
import { Location } from '@angular/common';
import { timer } from 'rxjs/internal/observable/timer';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'admin-products-form',
  templateUrl: './products-form.component.html',
  styles: [
  ]
})
export class ProductsFormComponent implements OnInit {
  editMode = false;
  form: FormGroup;
  isSubmitted = false;
  categories = [];
  imageDisplay: string | ArrayBuffer;
  currentProductId: string;

  constructor(
    private formBuilder: FormBuilder,
    private catServices: CategoriesService,
    private prodServices: ProductsService,
    private messageService: MessageService,
    private location: Location,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getCategories();
    this.checkEditMode();
  }

  onImageUpload(event) {
    const file  = event.target.files[0];

    if (file) {
      this.form.patchValue({image: file});
      this.form.get('image').updateValueAndValidity();
      const fileReader = new FileReader();
      fileReader.onload = () => { this.imageDisplay = fileReader.result }
      fileReader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.form.invalid) return;

    const prodForm = new FormData();
    Object.keys(this.form).map((key) => {
        prodForm.append(key, this.form[key])
    });

    if (this.editMode) {
      this.updateProduct(prodForm);
    } else {
      this.addProduct(prodForm);
    }
  }

  onCancel() {
    this.location.back();
  }

  private addProduct(prodData: FormData) {
    this.prodServices.createProduct(prodData).subscribe(
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

  private initForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      richDescription: [''],
      image: [''],
      price: ['', Validators.required],
      category: ['', Validators.required],
      countInStock: ['', Validators.required],
      isFeatured: [false],
    });
  }

  private getCategories() {
    this.catServices.getCategories().subscribe((cats) => {
      this.categories = cats;
    });
  }

  private checkEditMode() {
    this.route.params.subscribe((params) => {
      if (params.id) {
        this.editMode = true;
        this.currentProductId = params.id;
        this.prodServices.getProduct(params.id).subscribe((product) => {
          this.form.controls.name.setValue(product.name);
          this.form.controls.category.setValue(product.category.id);
          this.form.controls.price.setValue(product.price);
          this.form.controls.countInStock.setValue(product.countInStock);
          this.form.controls.isFeatured.setValue(product.isFeatured);
          this.form.controls.description.setValue(product.description);
          this.form.controls.richDescription.setValue(product.richDescription);
          this.imageDisplay = product.image;
          this.form.controls.image.setValidators([]);
          this.form.controls.image.updateValueAndValidity();
        });
      }
    });
  }

  private updateProduct(productFormData: FormData) {
    this.prodServices.updateProduct(productFormData, this.currentProductId).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Product is updated!'
        });
        timer(2000)
          .toPromise()
          .then(() => {
            this.location.back();
          });
      },
      () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Product is not updated!'
        });
      }
    );
  }
}

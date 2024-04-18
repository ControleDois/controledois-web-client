import {AfterViewInit, Component, EventEmitter, OnInit} from '@angular/core';
import { Auth } from 'src/app/shared/interfaces/auth.interface';
import { LibraryService } from 'src/app/shared/services/library.service';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-order-service-view',
  templateUrl: './order-service-view.component.html',
  styleUrls: ['./order-service-view.component.scss']
})
export class OrderServiceViewComponent implements OnInit, AfterViewInit {
  public auth: Auth;
  public os: any = {
    id: '',
    date_start: '',
    date_finish: '',
    equipment_received: '',
    serial_number: '',
    brand: '',
    model: '',
    note_equipment: '',
    note_problem: '',
    note_service: '',
    note_private: '',
    people: {
      name: '',
      role: '',
      document: '',
      ie: '',
      email: '',
      address: '',
      address_number: '',
      address_complement: '',
      address_district: '',
      address_city: '',
      address_state: '',
      zip_code: '',
      phone_commercial: ''
    },
    responsible: ''
  };

  emitter: EventEmitter<void> = new EventEmitter();

  constructor(
    public libraryService: LibraryService,
    private storageService: StorageService,
  ) {
    this.auth = this.storageService.getAuth();
   }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.emitter.emit();
  }

  getDateNow(): string {
    var data = new Date();
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var ano = data.getFullYear();

    return dia + '/' + mes + '/' + ano;
  }

}

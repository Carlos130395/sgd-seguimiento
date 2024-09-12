import { ComponentFixture, TestBed } from '@angular/core/testing';
import EmitidosComponent from './emitidos.component';

describe('EmitidosComponent', () => {
  let component: EmitidosComponent;
  let fixture: ComponentFixture<EmitidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmitidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmitidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MessagesModule, MessageModule],
  templateUrl: './app.component.html',
  providers: [MessageService],
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'sgd_seguimiento';
}

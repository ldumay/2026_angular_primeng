import { Component, OnInit, signal } from '@angular/core';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

@Component({
  selector: 'app-lazy-table-page',
  standalone: true,
  imports: [TableModule],
  templateUrl: './lazy-table-page.html',
  styleUrl: './lazy-table-page.scss',
})
export class LazyTablePage implements OnInit{
  readonly pageSize = 15;
  readonly paginatorPosition = 'top';
  readonly rowsPerPageOptions = [15, 50, 100, 250, 500, 1000, 2500, 5000];

  rows   = signal<User[]>([]);
  totalRecords = signal(0);
  loading      = signal(true);

  // Simule 10 000 entrées côté "serveur"
  private readonly TOTAL = 10_000;

  ngOnInit() {
    this.totalRecords.set(this.TOTAL);
  }

  loadData(event: TableLazyLoadEvent) {
    this.loading.set(true);

    const first = event.first ?? 0;
    const rows  = event.rows  ?? this.pageSize;

    // Simule un appel HTTP avec délai
    setTimeout(() => {
      this.rows.set(this.generatePage(first, rows));
      this.loading.set(false);
    }, 400);
  }

  private generatePage(offset: number, size: number): User[] {
    return Array.from({ length: size }, (_, i) => {
      const id = offset + i + 1;
      return {
        id,
        name:  `Utilisateur ${id}`,
        email: `user${id}@exemple.fr`,
        age:   20 + (id % 45),
      };
    }).filter(u => u.id <= this.TOTAL);
  }
}

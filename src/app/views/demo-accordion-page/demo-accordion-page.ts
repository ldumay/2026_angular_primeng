import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { AccordionModule, AccordionTabCloseEvent, AccordionTabOpenEvent } from 'primeng/accordion';
import { CardModule } from "primeng/card";
import { loremIpsum } from "lorem-ipsum";

@Component({
	selector: 'demo-accordion-page',
	standalone: true,
	imports: [
    CommonModule,
    AccordionModule,
    CardModule
],
	templateUrl: './demo-accordion-page.html',
	styleUrl: './demo-accordion-page.scss',
})
export class DemoAccordionPage implements OnInit {
    tabs: TestContent[] = [];

    accordionIsOpened = signal<boolean>(false);
    accordionValue = signal<number | null>(null);
    accordionValueLinked = signal<TestContent | null>(null);

    ngOnInit(): void {
		const newTabs: TestContent[] = [
			{
				id: 1,
				title: "Title 1",
				content: this.generateLoremIpsum(),
				author: "Author 1"
			},
			{
				id: 2,
				title: "Title 2",
				content: this.generateLoremIpsum(),
				author: "Author 2"
			},
			{
				id: 3,
				title: "Title 3",
				content: this.generateLoremIpsum(),
				author: "Author 3"
			},
            {
				id: 4,
				title: "Title 4",
				content: this.generateLoremIpsum(),
				author: "Author 4"
			}
		];
		this.tabs = newTabs;
	}

    /**
     * Use: https://codeberg.org/nickolas/lorem-ipsum.js.git
     */
    generateLoremIpsum(): string
    {
        const text: any = loremIpsum({
            count: 20,                // Number of words, sentences, or paragraphs.
            format: "plain",         // "plain" or "html".
            paragraphLowerBound: 3,  // Minimum sentences per paragraph.
            paragraphUpperBound: 7,  // Maximum sentences per paragraph.
            random: Math.random,     // PRNG function.
            sentenceLowerBound: 5,   // Minimum words per sentence.
            sentenceUpperBound: 15,  // Maximum words per sentence.
            suffix: "\n",            // Line ending for paragraphs.
            units: "sentences",      // "words", "sentences", or "paragraphs".
            // words: ["ad", "..."],    // Word list to draw from.
        });
        return text;
    }

    onOpen(event: AccordionTabOpenEvent) {
        console.log('Accordion tab opened:', event);
        this.accordionIsOpened.set(true);
        this.accordionValue.set(event.index);
        this.accordionValueLinked.set(this.tabs[event.index] ?? null);
    }

    onClose(event: AccordionTabCloseEvent) {
        console.log('Accordion tab closed:', event);
        this.accordionIsOpened.set(false);
        this.accordionValue.set(null);
        this.accordionValueLinked.set(null);
    }
}

interface TestContent{
    id: number;
    title: string;
    content: string;
    author: string;
}

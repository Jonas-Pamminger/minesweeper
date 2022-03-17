import {HttpClient, ToDoItem} from "./server-client.js";

let list: ListDisplay;
let addItem: AddItem;

function init(): void {
    const listDiv = $('#itemList');
    const input = $('#todo');
    const addBtn = $('#addBtn');
    const progress = $('#progress');
    if (!listDiv || !input || !addBtn) {
        alert('invalid HTML');
        return;
    }
    addItem = new AddItem(input, progress);
    list = new ListDisplay(listDiv);
    list.loadItems()
        .then(_ => {
            addBtn.on('click', () => {
                addItem.addNewItem(list);
            })
            alert('initial setup complete')
        });
}

$(function () {
    init();
});

class ListDisplay {
    private items: ToDoItem[];
    private readonly client: HttpClient;
    private readonly div: JQuery;

    constructor(contentDiv: JQuery) {
        this.items = [];
        this.div = contentDiv;
        this.client = new HttpClient();
    }

    public async loadItems(): Promise<void> {
        this.items = await this.client.getAllToDoItems();
        this.renderItems();
    }

    private renderItems(): void {

        function renderItem(item: ToDoItem): string {
            let html = '<li>';
            html += item.text;
            html += '</li>';
            return html;
        }

        let html = '<ul>';
        for (let item of this.items) {
            html += renderItem(item);
        }
        html += '</ul>';
        this.div.html(html);
    }
}

class AddItem {
    private readonly client: HttpClient;
    private readonly textBox: JQuery;
    private readonly progressBar: JQuery;
    private addInProgress: boolean;

    constructor(textBox: JQuery, progress: JQuery) {
        this.textBox = textBox;
        this.progressBar = progress;
        this.client = new HttpClient();
        this.addInProgress = false;
        this.toggleProgressBar(false, 0);
    }

    public addNewItem(list: ListDisplay): void {
        if (this.addInProgress) {
            return;
        }
        const text = this.text;
        if (!AddItem.validateText(text)) {
            alert('invalid todo text');
            return;
        }
        this.toggleProgressBar(true);
        this.addInProgress = true;
        this.client.addNewItem(text, () => {
            setTimeout(async () => {
                await list.loadItems();
                this.addInProgress = false;
                this.toggleProgressBar(false);
                this.textBox.val('');
            }, 1500);
        })
    }

    private toggleProgressBar(enabled: boolean, duration: number = 200): void {
        if (enabled) {
            this.progressBar.show(duration);
            return;
        }
        this.progressBar.hide(duration);
    }

    private get text(): string {
        const content = this.textBox.val();
        return <string>content;
    }

    private static validateText(str: string): boolean {
        function isNullOrEmptyString(stringVal: string): boolean {
            function isNullOrUndefined(val: any): boolean {
                return val === null || val === undefined || (typeof val == 'undefined');
            }

            stringVal = $.trim(stringVal);
            return isNullOrUndefined(stringVal) || stringVal === '';
        }

        function isWhitespaceString(stringVal: string): boolean {
            return !(/\S/.test(stringVal));
        }

        if (isNullOrEmptyString(str) || str === ' ') {
            return false;
        }
        return !isWhitespaceString(str);
    }
}

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class HttpClient {
    constructor() {
        this.baseUrl = "http://localhost:3000";
        this.todoGeneralUrl = `${this.baseUrl}/todos`;
    }
    getAllToDoItems() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield $.get(this.todoGeneralUrl);
        });
    }
    addNewItem(text, success) {
        const data = {
            text: text,
            done: false
        };
        // $.post(this.todoGeneralUrl, data, _ => {
        //     success();
        // });
        $.ajax({
            url: this.todoGeneralUrl,
            data: JSON.stringify(data),
            type: 'POST',
            contentType: 'application/json',
            processData: false,
            success: _ => success()
        });
    }
}
//# sourceMappingURL=server-client.js.map
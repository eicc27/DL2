import axios from "axios";
import BaseCrawler from "./BaseCrawler.js";
import { FIELDS, UA } from "../utils/Constants.js";//从指定路径的文件中导入 FIELDS 和 UA 这两个常量
import * as fs from 'fs';
import { JSDOM } from 'jsdom';
// 使用 import { JSDOM } from 'jsdom' 导入了 jsdom 模块中的 JSDOM 类
// jsdom 是一个基于 Node.js 的库，它模拟了浏览器环境，可以在 Node.js 中解析和操作 DOM。
// JSDOM 是 jsdom 模块提供的一个类，通过创建 JSDOM 实例，你可以将 HTML 字符串解析为一个虚拟的 DOM 对象，
// 并且可以在这个虚拟的 DOM 上执行各种 DOM 操作。
// 通过这个导入语句，可以在当前文件中使用 JSDOM 这个类，并使用 JSDOM 的实例来进行 DOM 解析和操作。

export default class SotACrawler extends BaseCrawler {
    /** 思考题：PWC的SotA上，每个领域只默认展示了5个子领域。怎么获取所有的子领域呢？
     * 提示：有一个See all ... tasks的按钮。到AreaCrawler里补全代码。
     * @param test whether it is needed to inspect the response.
     */
    // Promise<any> 表示一个 Promise 对象，该对象可以异步地返回任意类型的值。
    // 在 TypeScript/JavaScript 中，Promise 是用于处理异步操作的一种机制。它可以包装一个异步操作，并在操作完成后返回一个结果或抛出一个错误。
    // Promise < any > 中的 < any > 表示 Promise 对象可以返回任意类型的值。
    // 这意味着在 resolve（完成）时，可以返回任何类型的值；而在 reject（拒绝）时，可以抛出任何类型的错误。
    // 你可以使用 Promise < any > 来表示一个异步操作，并在异步操作完成后获得任意类型的结果。
    // 例如，在之前的代码片段中，crawl 方法返回类型为 Promise<any>，表示在异步操作完成后可以返回任意类型的结果。
   
    public override async crawl(test = true): Promise<any> {
        const response = await axios.get('https://paperswithcode.com/sota', {
            headers: {
                "User-Agent": UA
            }
        });
        const data = response.data;//response.data 是一个表示 HTTP 响应数据的属性。它通常包含从服务器返回的实际数据。
        if (test) {
            fs.writeFileSync('SotA.html', data);
            return;
        }
        const jsDom = new JSDOM(data);
        const crawledDocument = jsDom.window.document;// 获取 DOM 文档对象
        // do something to the document to get the fields...
        // use FIELDS in Constants.ts.
        const areaElement = crawledDocument.querySelectorAll('.card-deck.card-break.infinite-item');
        let counter = 0;

       
        for (const elem of areaElement) {
            const fieldElements = elem.querySelectorAll('a');
            for (const fieldElement of fieldElements) {
                const field = fieldElement.getAttribute('href')?.slice('/task/'.length)!;
                 // 这段代码使用了一个嵌套的循环来遍历 areaElement 中的每个元素，然后在每个元素中查询所有 < a > 元素并进行处理。
                 // 对于每个 elem 元素，通过 elem.querySelectorAll('a') 方法获取到当前元素下的所有 < a > 元素，并将其赋值给变量 fieldElements。
                 // 然后，再对 fieldElements 进行遍历，通过 fieldElement.getAttribute('href') 方法获取到 < a > 元素的 href 属性值，
                 // 即链接地址。通过.slice('/task/'.length) 将链接地址的指定部分截取出来，然后将截取的结果赋值给 field 变量。
                FIELDS.push(field);//将 field 添加到 FIELDS 数组中
            }
            
            counter++;
            if (counter >= 2)
                break;
        }

    }
}
// 这段代码是一个SotACrawler类，继承自BaseCrawler类。主要实现了从Papers with Code的SotA页面获取所有子领域的功能。

// 具体代码解析如下：

// 引入了axios、BaseCrawler、FIELDS、UA、fs和JSDOM模块。
// 定义了一个SotACrawler类，继承自BaseCrawler类。
// crawl方法使用async / await语法，发送GET请求获取SotA页面的内容，然后使用JSDOM将获取到的内容解析为DOM对象。
// 如果test参数为true，则将获取到的网页内容保存到SotA.html文件中并返回。
// 如果test参数为false，则从解析后的DOM对象中找到包含子领域的元素，并提取出子领域的信息。
// 使用querySelectorAll方法找到所有带有.card - deck.card -break.infinite - item类的元素，即每个领域的容器。
// 遍历每个领域的容器，使用querySelectorAll方法找到容器内所有的a标签元素，即表示每个子领域的链接。
// 遍历每个子领域的链接元素，获取其href属性值，并截取'/task/'之后的部分，即子领域的名称。
// 将子领域名称添加到FIELDS数组中。
// 注意，代码中有一个counter变量用于控制只获取前两个领域的子领域，可以根据需求进行调整。
// 需要注意的是，这段代码同样是 JavaScript / TypeScript 代码，并非 Python 代码，无法在Python环境中直接运行。
//如果您希望在Python中执行网页爬取，建议使用Python相关的库，如Requests和BeautifulSoup等。
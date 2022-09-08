import  Router } from 'itty-router';

const router = Router();
const baseUrl = 'https://www.iwara.tv'
const baseUrl2 = 'https://ecchi.iwara.tv'

router.get('/', () => {
	return new Response(`
	<table>
	<tr>
			<td>路径</td>
			<td>参数</td>
			<td>说明</td>
	</tr>
	<tr>
			<td>/videos/排序方式/页码</td>
			<td>排序方式,likes,date,views,页码从0开始</td>
			<td>返回视频id</td>
	</tr>
	<tr>
			<td>/video/视频vid</td>
			<td>vid：视频id</td>
			<td>返回视频播放链接</td>
	</tr>
	<tr>
			<td>/file/视频vid</td>
			<td>vid：视频id</td>
			<td>返回视频媒体资源</td>
	</tr>
	<tr>
			<td>/sites/图片地址</td>
			<td>将源地址复制即可</td>
			<td>返回视频的封面</td>
	</tr>
</table>
	`,{
		headers: {
			"Content-Type": "text/html;charset=UTF-8"
		}
	});
});

// 表区开始
router.get("/videos/:sort/:page", ({ params,url}) => {
  const sort = params.sort;
  const page = params.page;
  const reg = /<a href="\/videos\/(.*?)"><img src="(.*?)" width="220" height="150" alt=".*?" title="(.*?)" \/>/g;
  const endPage = /<a title=".*?" href="\/videos.*?page=(.*?)">/g;
  return fetch(`${baseUrl}/videos?sort=${sort}&page=${page}`).then((res) => res.text()).then((data) => {
    let a = "";
    let i = 0;
    const ids = {
      "code": 1,
      "data": {},
      "limit": null
    };
    const Url = new URL(url)
    while (a = reg.exec(data)) {
    const cove = a[2].replace("\/\/i.iwara.tv",Url.hostname)
      ids["data"][i] = { name: a[3], playUrl:'https://'+Url.hostname+'/file/'+ a[1], cover: 'https://'+cove };
      i++;
    }
    while (a = endPage.exec(data)) {
      ids["limit"] = a[1];
    }
    return new Response(JSON.stringify(ids), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  });
});

router.get('/sites/*', (req) => {
	const source_url = new URL(req.url);
	const path = source_url.pathname
	return fetch(`https://i.iwara.tv${path}`)
});

router.get('/video/:vid', ({ params }) => {
	const vid = params.vid
	return fetch(`${baseUrl}/api/video/${vid}`)
});

router.get('/file/:vid', ({ params }) => {
	const vid = params.vid
	return fetch(`${baseUrl}/api/video/${vid}`)
	.then((res)=>res.json())
	.then(data=>{
		const url = data[0]["uri"]
		
		return fetch('https:'+url)
	})
});
// 表区结束

// 里区开始
function getIds(params,url){
	const sort = params.sort;
  const page = params.page;
  const reg = /<a href="\/videos\/(.*?)"><img src="(.*?)" width="220" height="150" alt=".*?" title="(.*?)" \/>/g;
  const endPage = /<a title=".*?" href="\/videos.*?page=(.*?)">/g;
	// 请求页面
	return fetch(`${baseUrl2}/videos?language=de&sort=${sort}&page=${page}`,{

	}).then((res) => res.text()).then((data) => {
		let a = "";
		let i = 0;
		const ids = {
			"code": 1,
			"data": {},
			"limit": null
		};
		const Url = new URL(url)
		while (a = reg.exec(data)) {
		let cove = a[2].replace("\/\/ecchi.iwara.tv",Url.hostname).replace("i.iwara.tv",Url.hostname)
			ids["data"][i] = { name: a[3], playUrl:'https://'+Url.hostname+'/18/file/'+ a[1], cover: 'https://'+cove };
			i++;
		}
		while (a = endPage.exec(data)) {
			ids["limit"] = a[1];
		}
		return ids
	});
}
router.get("/18/videos/:sort/:page", ({ params,url}) => {
	return getIds(params,url).then((ids)=>{
		console.log(ids);
		return new Response(JSON.stringify(ids), {
			headers: {
				// "Content-Type": "text/html; charset=utf-8"
				"Content-Type": "application/json"
			}
		});
	})
  
	})

router.get('/18/sites/*', (req) => {
	const source_url = new URL(req.url);
	const path = source_url.pathname
	return fetch(`https://i.iwara.tv${path}`)
});

router.get('/18/video/:vid', ({ params }) => {
	const vid = params.vid
	return fetch(`${baseUrl2}/api/video/${vid}`)
});

router.get('/18/file/:vid', ({ params }) => {
	const vid = params.vid
	return fetch(`${baseUrl2}/api/video/${vid}`)
	.then((res)=>res.json())
	.then(data=>{
		const url = data[0]["uri"]
		return fetch('https:'+url)
	})
});

// 里区结束

/*
This is the last route we define, it will match anything that hasn't hit a route we've defined
above, therefore it's useful as a 404 (and avoids us hitting worker exceptions, so make sure to include it!).

Visit any page that doesn't exist (e.g. /foobar) to see it in action.
*/
router.all('*', () => new Response('{"code":0}', { status: 404,headers:{"Content-Type": "application/json"} }));

export default {
	fetch: router.handle,
};

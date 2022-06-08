import Joi from 'joi'
import express from 'express';
import fs from 'fs';
import path from 'path';
import * as capture from './capture.js';

const app = express();
const dirname = path.dirname(new URL(import.meta.url).pathname)

app.use(express.static(path.join(dirname, 'public')))

app.get('/', (req, res) => {
	res.json({ "pet": "dog" });
	console.log('GETリクエストを受け取りました')
	res.end();
})

app.get('/api/capture', function (req, res) {

	const schema = Joi.object({
		width: Joi.number(),
		height: Joi.number(),
		url: Joi.string().uri(),
		wait: Joi.number(),
		full: Joi.bool(),
	})

	const result = schema.validate(req.query);

	if (result.error) {
		res.status(400).send(result.error);
		return;
	}

	test(result).then(response => {
		fs.readFile('./dest/screenshot.png', (err, data) => {
			res.type('png');
			res.send(data);
		});
	})

});

async function test(result) {
	await capture.captureScreenshot(result.value.url, result.value.width, result.value.height, result.value.wait, result.value.full);
	await capture.imageOptimization();
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`Starting Server Port:${port}`);
});
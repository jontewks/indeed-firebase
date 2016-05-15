'use strict'

const rp = require('request-promise')
const Promise = require('bluebird')
const Firebase = require('firebase')
const Progress = require('progress')

let jobsReceived = 0
const totalJobsToGet = 50
const limit = 25
const requestOptions = {
	uri: 'http://api.indeed.com/ads/apisearch',
	qs: {
		v: 2,
		q: 'a -anxiety',
		publisher: 2177713169811438,
		fromage: 'last',
		sort: 'date',
		latlong: 1,
		format: 'json',
		limit,
		start: jobsReceived
	},
	json: true
}

const progressBar = new Progress('\tProgress [:bar] :percent :elapsed :current/:total', {
  total: totalJobsToGet,
  complete: '=',
  incomplete: ' ',
  width: 35
});

const makeApiRequest = () => {
	rp(requestOptions)
		.then(res => Promise.map(res.results, createJobPromise))
		.then(() => jobsReceived += limit)
		.then(finishApiRequest)
}

const createJobPromise = job => {
	const fireBaseRef = new Firebase(`https://sweltering-inferno-7675.firebaseio.com/${job.jobkey}`)
	return new Promise(resolve => {
		fireBaseRef.set(job, () => {
			progressBar.tick()
			resolve()
		})
	})
}

const finishApiRequest = () => {
	if (jobsReceived < totalJobsToGet) {
		return makeApiRequest()
	}
	process.exit()
}

makeApiRequest()

import mongo from "../../database.js";
import logger from "../../logger.js";

class VideoRepository {
	static collectionName = "videos";

	static async getVideoAsync(videoId) {
		return await mongo.db.collection(VideoRepository.collectionName).findOne({ _id: videoId });
	}

	static async upsertVideoAsync(data) {
		const query = { videoId: data.videoMeta.id };
		const update = {
			$set: { 
				title: data.videoMeta.title,
				likes: data.videoMeta.likes,
				views: data.videoMeta.views,
				length: data.videoMeta.length,
				opportunityCost: data.videoMeta.opportunityCost,
				updatedOn: new Date(),
				thumbnails: data.videoMeta.thumbnails
			},
			$setOnInsert: {
				channelId: data.channelMeta.id,
				publishDate: data.videoMeta.publishDate,
				createdOn: new Date()
			}
		};

		await mongo.db.collection(VideoRepository.collectionName).updateOne(query, update, { upsert: true });
	}

	static async getTopVideosByOpportunityCost(page, pageSize, success) {
		mongo.db.collection(VideoRepository.collectionName).find().skip(page * pageSize).limit(pageSize).sort({ opportunityCost: -1 }).toArray((err, result) => {			
			if (err) {
				logger.error(err);
				throw err;
			}
				
			success(result);
		  });
	}

	static async getTotalOpportunityCostForChannelVideos(channelId, success) {
		return mongo.db.collection(VideoRepository.collectionName).aggregate([
			{$match:{ channelId: channelId }},
			{ $group:{ _id: null, TotalSum: { $sum: "$opportunityCost" }} }
		]).toArray((error, results) => {
			success(results);
		});
	}
}

export default VideoRepository;
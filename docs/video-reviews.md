# Video reviews

The frontend collection is defined in src/content/video-reviews.json. Each entry has a stable id, title, and src (a public video URL). Add entries to this list to show multiple videos in the portrait video carousel. Local video files live in public/videos. Do not invent reviewer names or ratings.

Future backend integration: replace the JSON import in ReviewSources with published records fetched by a server component and passed as props. An admin upload workflow should store videos in object storage, save id/title/src plus optional poster and captions, and allow publishing, ordering, and deletion. VideoReviewCarousel accepts an array, displays a larger central portrait video with smaller neighbours, autoplays the active video with audio (subject to browser autoplay permissions), uses an invisible click/keyboard target to pause or resume without native controls, and pauses inactive or offscreen videos. No admin UI, upload endpoint, or backend has been implemented yet.

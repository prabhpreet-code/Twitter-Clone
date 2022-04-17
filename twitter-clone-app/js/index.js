const URL = "http://localhost:3000/tweets";

//search tweets with enter key
const onEnter = (e) =>{
  if(e.key == "Enter"){
    getTwitterData() ;
  }
}

// next page info at starting
const nextPageData = {
  loading: false,
  url: null // next 10 tweets
}

//check if next page url is present
const onNextPage = () => {
  
  if(nextPageData.url){
      getTwitterData(true);// geting next pages info
  }
}

// get twitter data from REST APIs
const getTwitterData = (nextPage=false) => {
  const query = document.getElementById('user-search-bar').value;
  if(!query) return;
  const encodedQuery = encodeURIComponent(query);//encodes url as url has it's own meanings for special characters #,*,@ ....
  const params = `q=${encodedQuery}&result_type=mixed`;
  let fullUrl = `${URL}?${params}`;

  //if nextPage is true then get tweets for next page otherwise get tweets for the particular query
  if(nextPage){
      fullUrl = nextPageData.url;
      nextPageData.loading = true;
  }

  //fetch data from NodeJS server
  fetch(fullUrl, {
      method: 'GET'
  }).then((response)=>{
      return response.json();
  }).then((data)=>{
      saveNextPage(data.search_metadata);//save next page url
      buildTweets(data, nextPage);//show tweets/nextTweets to the user
  });
}

//  Save the next page data
 const saveNextPage = (metadata) => {
  nextPageData.url = `${URL}${metadata.next_results}`;
  nextPageData.loading = false;
  console.log(nextPageData.url);
}

//  Handle when a user clicks on a trend 
const selectTrend = (e) => {
  document.getElementById('user-search-bar').value = e.innerText ;
  getTwitterData() ;
}

  // Build Tweets HTML based on Data from API
 
const buildTweets = (tweets, nextPage) => {
  let nextButton = "" ;
  let twitterContent = "" ;
  const tweetsContent = tweets.statuses ;

  //looping each and every tweet
  tweetsContent.map((tweet) => {
    const createdDate = moment(tweet.created_at).fromNow();//date

    twitterContent+= 
    `<div class="individual-tweet">
        <div class="individual-profile-container">
          <div class="profile-pic" style="background-image: url(${tweet.user.profile_image_url_https})"></div>
          <div class="tweet-user-details">
            <div class="individual-name">${tweet.user.name}</div>
            <div class="individual-twitter-handle">@${tweet.user.screen_name}</div>
        </div>
    </div>`

    //check if media is present
    if(tweet.extended_entities 
      && tweet.extended_entities.media
      && tweet.extended_entities.media.length > 0){
          twitterContent += buildImages(tweet.extended_entities.media);//build images section of the tweets
          twitterContent += buildVideo(tweet.extended_entities.media);//build videos/gifs section of the tweets
    }

  twitterContent+= `<div class="individual-tweet-text">${tweet.full_text}</div>
      <div class="individual-tweet-created">
      ${createdDate}</div>
</div>`
  })

    // Check if tweets section is being built for next page tweets or for fresh query
  if(nextPage){
    //find and remove the next button
    if((document.getElementById('next-page-for-tweets')) != null){
      const deleteNext = document.querySelector('.next-page-container');
      deleteNext.remove() ;
    }
    //append tweets to the previous collection of tweets
    document.querySelector('.tweets-container').insertAdjacentHTML('beforeend', twitterContent)
    
    //if next page is present then append the button to the HTML
    if (tweets.search_metadata.next_results) {
      nextButton += `<div class="next-page-container">
    <div id="next-page-for-tweets" onclick="onNextPage()">
        <i class="fas fa-arrow-down"></i>
    </div>
</div>`
    document.querySelector('.tweets-container').insertAdjacentHTML('beforeend', nextButton)
    }
    
    //for fresh queries
}
 else {
  if (tweets.search_metadata.next_results) {
    twitterContent+= `<div class="next-page-container">
  <div id="next-page-for-tweets" onclick="onNextPage()">
      <i class="fas fa-arrow-down"></i>
  </div>
</div>`
  document.querySelector('.tweets-container').innerHTML = twitterContent;
    }
    
  }
  
}

  // Build HTML for Tweets Images
 const buildImages = (mediaList) => {
  let imagesContent = `<div class="tweet-images-container">`;
  let imagesExist = false;
  mediaList.map((media)=>{
      if(media.type == "photo"){
          imagesExist = true;
          imagesContent += `
              <div class="tweet-image" style="background-image: url(${media.media_url_https})"></div>
          `
      }
  })
  imagesContent += `</div>`;
  return (imagesExist ? imagesContent : '');
}


  // Build HTML for Tweets Video/Animated_gifs
 
 const buildVideo = (mediaList) => {
  let videoContent = `<div class="tweet-video-container">`;
  let videoExists = false;
  mediaList.map((media)=>{
      if(media.type == "video" || media.type == 'animated_gif'){
          videoExists = true;
          const video = media.video_info.variants.find((video)=>video.content_type == 'video/mp4');
          const videoOptions = getVideoOptions(media.type);
          videoContent += `
          <video ${videoOptions}>
              <source src="${video.url}" type="video/mp4">
              Your browser does not support HTML5 video.
          </video>
          `
      }
  })
  videoContent += `</div>`;
  return (videoExists ? videoContent : '');
}

//whether video or gifs
const getVideoOptions = (mediaType) => {
  if(mediaType == 'animated_gif'){
      return "loop autoplay";
  } else {
      return "controls";
  }
}
 

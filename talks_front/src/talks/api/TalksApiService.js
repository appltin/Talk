import axios from "axios";
import { jsonApiClient } from "./jsonApiClient";
import { parsePath } from "react-router-dom";

export const register = async (user) => {
    try {
        const response = await jsonApiClient.post(`/register`, user);
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export const getSignedUrl = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await axios.post('https://talks-production.up.railway.app/cloud/uploadImg', formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // 這裡會自動處理
            },
        });
        return response.data; // 返回圖片的 URL
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export async function deleteImage(imageUrl) {
    try {
        const response = await axios.delete('https://talks-production.up.railway.app/cloud/deleteImg', {
            params: {
                imageUrl: imageUrl
            }
        });
        return response.data; // 返回 API 回應的數據

    } catch (error) {
        console.error('Failed to delete image:', error);
        throw error; // 重新拋出錯誤，方便調用方處理
    }
}

export async function getUserInformation(username){
    try{
        const response = await axios.get('https://talks-production.up.railway.app/article/getUerInformation',{
            params:{
                username : username
            }
        });
        return response.data;

    }catch(error){
        console.log('Failed to getAvatarAndUerId:', error)
        throw error;
    }
}

export async function addArticle(article){
    try{
        const response = await axios.post('https://talks-production.up.railway.app/article/add', article)
        return response.data;

    }catch(error){
        console.log('Failed to addArticle:', error)
        throw error;
    }
}

// 加入收藏
export async function addFavoriteBoard(userId, boardId){
    try{
        const response = await axios.post('https://talks-production.up.railway.app/user/addFavoriteBoard', { 
            userId : userId,  
            boardId : boardId
        })
        return response.data
    }catch(error){
        console.log('Failed to addToFavorites:', error)
        throw error;
    }
};

// 取消收藏
export async function removeFavoriteBoard(userId, boardId){
    try{
        const response = await axios.delete(`https://talks-production.up.railway.app/user/removeFavoriteBoard`, {
            params: {
                userId: userId,
                boardId: boardId
            }
        })
        
        return response.data
    }catch(error){
        console.log('Failed to removeFromFavorites:', error)
        throw error
    }
};

export async function getPopularArticle(){
    try{
        const response = await axios.get('https://talks-production.up.railway.app/article/popular')
        return response.data
    }catch(error){
        console.log('Failed to getPopularArticle:', error)
        throw error
    }
}

export async function getLatestArticle(){
    try{
        const response = await axios.get('https://talks-production.up.railway.app/article/latest')
        return response.data
    }catch(error){
        console.log('Failed to getPopularArticle:', error)
        throw error
    }
}

export async function getFavoriteBoardId(userId){
    try{
        const response = await axios.get('https://talks-production.up.railway.app/user/getFavoriteBoardId', {
          params : {
            userId : userId
        }})
        
        return response.data
    }catch(error){
        console.log('Failed to getFavoriteBoardId:', error)
        throw error
    }
}

export async function getFavBoardArticles(boardIds) {
    try {
        const response = await axios.get('https://talks-production.up.railway.app/article/getFavBoardArticles', {
            params: { 
                boardIds: boardIds
            },
            paramsSerializer: params => {
                // 確保 boardIds 是陣列並且不為 null 或 undefined
                const validBoardIds = Array.isArray(params.boardIds) ? params.boardIds : [];
                return `boardIds=${validBoardIds.join(',')}`;
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Failed to getFavBoardArticles:', error);
        throw error;
    }
}

// 獲取指定版的文章
export async function getSpecifyBoardArticle(boardName) {
    try {
        const response = await axios.get(`https://talks-production.up.railway.app/article/getSpecifyBoard/${boardName}`);
        return response.data;
    } catch (error) {
        console.error('Failed to getSpecifyBoardArticles:', error);
        throw error;
    }
}


// 獲取指定文章
export async function getArticleById(articleId) {
    try {
        const response = await axios.get(`https://talks-production.up.railway.app/article/getArticleById/${articleId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to getArticleById:', error);
        throw error;
    }
}

// 增加文章的 love
export async function incrementArticleLove(articleId) {
    try {
        const response = await axios.post(`https://talks-production.up.railway.app/article/incrementLove/${articleId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to incrementArticleLove:', error);
        throw error;
    }
}

// 減少文章的 love
export async function decrementArticleLove(articleId) {
    try {
        const response = await axios.post(`https://talks-production.up.railway.app/article/decrementLove/${articleId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to incrementArticleLove:', error);
        throw error;
    }
}

// 新增留言
export async function addMessage(message) {
    try {
        const response = await axios.post('https://talks-production.up.railway.app/message/addMessage', message
        );
        return response.data;
    } catch (error) {
        console.error('Failed to addMessage:', error);
        throw error;
    }
}

// 新增留言愛心
export async function incrementMessageLove(messageId) {
    try {
        const response = await axios.post(`https://talks-production.up.railway.app/message/incrementMessageLove/${messageId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to incrementMessageLove:', error);
        throw error;
    }
}

// 新增留言愛心
export async function decrementMessageLove(messageId) {
    try {
        const response = await axios.post(`https://talks-production.up.railway.app/message/decrementMessageLove/${messageId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to incrementMessageLove:', error);
        throw error;
    }
}

// 根據文章 ID 獲取留言
export async function getMessagesByArticleId(articleId) {
    try {
        const response = await axios.get(`https://talks-production.up.railway.app/message/getMessagesByArticleId/${articleId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to getMessagesByArticleId:', error);
        throw error;
    }
}

//取得推薦看板資料
export async function getRecommendBoardsInformation() {
    try {
        const response = await axios.get('https://talks-production.up.railway.app/article/getRecommendBoards');
        return response.data;
    } catch (error) {
        console.log('Failed to getRecommendBoards:', error);
        throw error;
    }
}

//取得所有看板資料
export async function getAllBoardsInformation() {
    try {
        const response = await axios.get('https://talks-production.up.railway.app/article/getAllBoards');
        return response.data;
    } catch (error) {
        console.log('Failed to getRecommendBoards:', error);
        throw error;
    }
}

//取得頭像
export async function getAvatar(userId) {
    try {
        const response = await axios.get('https://talks-production.up.railway.app/article/getAvatarUrl',{
            params: { 
                userId: userId
        }
        });
        return response.data;
    } catch (error) {
        console.log('Failed to getAllBoards:', error);
        throw error;
    }
}

//取得用戶發的文
export async function getArticlesByUserId(userId) {
    try {
        const response = await axios.get('https://talks-production.up.railway.app/article/getArticlesByUserId',{
            params: { 
                userId: userId
        }
        });
        return response.data;
    } catch (error) {
        console.log('Failed to getAllBoards:', error);
        throw error;
    }
}

//刪除文章
export async function deleteArticle(articleId) {
    try {
        const response = await axios.delete('https://talks-production.up.railway.app/article/delete', {
            params: {
                articleId: articleId
            }
        });
        return response.data; // 返回 API 回應的數據

    } catch (error) {
        console.error('Failed to delete image:', error);
        throw error; // 重新拋出錯誤，方便調用方處理
    }
}

//取得用戶追蹤看板資訊
export async function getFavoriteBoardInfo(userId) {
    try {
        const response = await axios.get('https://talks-production.up.railway.app/user/getFavoriteBoardInfo',{
            params: { 
                userId: userId
        }
        });
        return response.data;
    } catch (error) {
        console.log('Failed to getAllBoards:', error);
        throw error;
    }
}

//更改密碼
export async function changePassword(password, userId){
    try{
        const response = await axios.post('https://talks-production.up.railway.app/user/updatePassword', { 
            userId : userId,  
            password : password
        })
        return response.data
    }catch(error){
        console.log('Failed to changePassword:', error)
        throw error;
    }
};

//刪除帳號
export async function deleteAccount(userId) {
    try {
        const response = await axios.delete('https://talks-production.up.railway.app/user/deleteAccount', {
            params: {
                userId: userId
            }
        });
        return response.data; // 返回 API 回應的數據

    } catch (error) {
        console.error('Failed to delete account:', error);
        throw error; // 重新拋出錯誤，方便調用方處理
    }
}

//更改密碼
export async function updateArticle(article){
    try{
        const response = await axios.post('https://talks-production.up.railway.app/article/edit', article)
        return response.data
    }catch(error){
        console.log('Failed to update article:', error)
        throw error;
    }
};


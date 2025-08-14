import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes , useNavigate} from 'react-router-dom';
import { donate, getArticlesByUserId, deleteArticle, getFavoriteBoardInfo, removeFavoriteBoard, changePassword, deleteAccount } from './api/TalksApiService'
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Update.css'
import { useAuth } from './security/AuthContext';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGratipay } from '@fortawesome/free-brands-svg-icons';
import { Dropdown } from 'react-bootstrap';
import { FaChevronDown } from 'react-icons/fa';
import { faFilePen, faPenNib, faBell } from '@fortawesome/free-solid-svg-icons';  // 導入具體圖標
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';


function UpdateComponent() {
  const [selectedMenu, setSelectedMenu] = useState('myArticle');
  const [myArticle, setMyArticle] = useState([])
  const [boards, setAttractBoard] = useState([])
  
  const authContext = useAuth();
  const userId = authContext.userId
  const avatar = authContext.avatar
  const username = authContext.username
  // const setAuthInterceptor = authContext.setAuthInterceptor
  const logout = authContext.logout
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [amount, setAmount] = useState(150);   
  const handleSelectAmount = (v) => setAmount(v);

  // 贊助平臺
  const handleDonate = async () => {
    try {
      const formHtml = await donate(0, amount); // 0 代表贊助平台
      const w = window.open('', '_blank');       // 新視窗自動送出表單
      w.document.open();
      w.document.write(formHtml);
      w.document.close();
    } catch (e) {
      alert('送出贊助失敗，請稍後再試');
    }
  };
  
  //更新密碼
  const handleSubmit = async(e) => {
    e.preventDefault();

    try{
      // 檢查密碼是否為空
      if (!password) {
        alert('Password cannot be empty');
        return;
      }

      //檢查confirmPassword是否一致
      if (password === confirmPassword) {
        await changePassword(password, userId)
        alert('Password changed successfully ')
        // 移除 localStorage 中的舊 Token
        localStorage.removeItem('authToken');

        // 移除 sessionStorage 中的舊 Token
        sessionStorage.removeItem('authToken');
        logout()
        // navigate('/')
        handleClose();
        
      } else {
        alert('Password mismatch');
      }
    }catch(error){

    }
  };

  useEffect(() => {

    fetchArticles()
    getAttractBoard()

  }, []); 

  // 取得我的文章
  const fetchArticles = async () => {
    try {
        const articles = await getArticlesByUserId(userId);
        if (!Array.isArray(articles)) {
            console.error('Received data is not an array:', articles);
            return;
        }
        setMyArticle(articles);
    } catch (error) {
        console.error('fail to filter article', error);
    }
  };

  // 取得用戶追蹤看板
  const getAttractBoard = async () => {
    try {
        const boards = await getFavoriteBoardInfo(userId);
        setAttractBoard(boards);
    } catch (error) {
        console.error('fail to get attract board', error);
    }
  };

  // 刪除文章
  const handleDelete = async (articleId) => {
    if(window.confirm('Are you sure you want to remove article ?')){

      try {
        const result = await deleteArticle(articleId);
        // 刷新
        const articles = await getArticlesByUserId(userId); 
        setMyArticle(articles);

      } catch (error) {
          console.error('fail to delete article', error);
      }

    };
  }

  // 取消追蹤
  const handleCancelSubmit = async (boardId) => {
    if(window.confirm('Are you sure you want to unfollow ?')){
      try {
        await removeFavoriteBoard(userId, boardId)
        getAttractBoard() //刷新
      } catch (error) {
          console.error('fail to handle cancel submit', error);
      }
    }
    
  };

  //刪除帳號
  const handleDeleteAccount = async () => {
    const userInput = window.prompt('Please type "delete account" to confirm the deletion:');
    if (userInput === 'delete account') {
      if (window.confirm('Are you sure you want to delete your account?')) {
        try {
          await deleteAccount(userId);
        } catch (error) {
          console.error('Failed to handle account deletion', error);
        }
      }
    } else {
      alert('Deletion canceled: input did not match "delete account".');
    }
  };

  return (
    <div className='container-fluid updatePage_container justify-content-center'>
      <div className='row h-100 updatePage_row'>

          {/* 左側選單 */}
          <div className="col-3" style={{background: 'rgb(68, 22, 159)' }}>
              <div className='d-flex flex-column align-items-center mt-3 updatePage_bottom'>
                <div className='updatePage_avatarContainer'>
                  <img src={avatar} alt='' className='updatePage_avatar'/>
                </div>
                {/* <h2 className='text-white mt-3 mb-5'>{username}</h2> */}
              </div>

              <button 
                onClick = {() => setSelectedMenu('myArticle')}
                className = 'd-flex w-100 justify-content-start align-items-center py-3 updatePage_button border-0'
              >
                  <FontAwesomeIcon icon={ faFilePen } className='me-3 updatePage_iArticle'/>
                  <h3 className = 'm-0'>Edit article</h3>
              </button>

              <button 
                onClick={() => setSelectedMenu('favorites')}
                className='d-flex w-100 justify-content-start align-items-center py-3 updatePage_button border-0'
              >
                  <i class="bi bi-hearts me-3 updatePage_iLove"></i>
                  <h3 className='m-0'>Favotie boards</h3>
              </button>

              <button 
                onClick = {() => setSelectedMenu('setting')}
                className = 'd-flex w-100 justify-content-start align-items-center py-3 updatePage_button border-0'
              >
                  <i class = "bi bi-gear-fill me-3 updatePage_i"></i>
                  <h3 className = 'm-0'>Setting</h3>
              </button>

              <button 
                onClick = {() => setSelectedMenu('donate')}
                className = 'd-flex w-100 justify-content-start align-items-center py-3 updatePage_button border-0'
              >
                  <i class = "bi bi-piggy-bank me-3 updatePage_donate"></i>
                  <h3 className = 'm-0'>Donate</h3>
              </button>
          </div>


          {/* 右側白色內容區塊 */}
          <div className="col-9 content updatePage_whtieArea no-scrollbar" style={{ padding: '20px 40px', background: '#fff', height: '100%', overflowY : 'scroll'}}>
            <div className='py-1 px-3'>
              {/* 選項一,  我的文章 */}
              { selectedMenu === 'myArticle' && 
                  
                  <div className='updatePage_noShadow'>
                    <h3 className='border-bottom pt-1 pb-4 text-body'>My article</h3>

                    {myArticle && myArticle.map((article) => (
                                            
                      <div key = 
                          {article.articleId} 
                          className='d-flex border-bottom' 
                          style={{ height: 'auto' }}
                      >
                        <div className='py-3'>

                              <div className='d-flex mb-2 mainPage_gray h5 align-items-center'>
                                  <Dropdown className='me-3 pt-2'>
                                    <Dropdown.Toggle variant="secondary" id="dropdown-basic" className='updatePage_drop border-0'>
                                      <FontAwesomeIcon icon={ faFilePen } />
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                      <Dropdown.Item href="#/action-1" onClick = {() => navigate(`/edit/${article.articleId}`)}>edit</Dropdown.Item>
                                      <Dropdown.Item href="#/action-2" onClick={() => handleDelete(article.articleId)}>delete</Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                  <span>{ article.board }</span>
                                  <span className='mainPage_spaceTab'> · </span>

                                  <span>{ article.username }</span>
                                  <span className='mainPage_spaceTab'> · </span>

                                  <span>{new Date(article.time).toLocaleDateString()}</span>
                                  
                              </div>

                              {/* 文章內容 */}
                              <div className='mt-3 mb-3 fw-bold h2 mainPage_deepGray fs-3'>{article.title}</div>
                              <h5 className='mb-3 mainPage_deepGray'>
                                  {article.firstImgUrl.trim() !== ''
                                      ? `${article.content.substring(0, 38)}...`
                                      : `${article.content}...`}
                              </h5>

                              <div className="d-flex align-items-center">
                                  <FontAwesomeIcon icon={faGratipay} color="#fa3b2ae5" className='mainPage_iconSize'/>
                                  <h5 className="ms-1 mainPage_gray m-0" style={{ lineHeight: '25px' }}>{article.love}</h5>
                                  <i className="ms-4 bi bi-chat-heart-fill mainPage_Blue mainPage_iconSize"></i>
                                  <h5 className="ms-1 mainPage_gray m-0" style={{ lineHeight: '25px' }}>10</h5>
                              </div>
                          </div>

                          {/* 圖片 */}
                          { article.firstImgUrl.trim() && 
                              <div className='d-flex align-items-start ms-auto pb-3 pt-5' style={{ height: 'auto' }}>
                                  <img src={article.firstImgUrl}
                                      alt={article.firstImgUrl}
                                      className='mainPage_ArticleImg'
                                  />
                              </div>
                          }
                        </div>))}
                    </div>
              }
            </div>
            
            {/* 選項二, 追蹤看板 */}
            {selectedMenu === 'favorites' && 

              <div className='updatePage_noShadow'>
                <h3 className='border-bottom pb-4 text-body'>My attract boards</h3>

                <div className='updatePage_imgContainer w-100'>
                  {boards.map((board) => (
                    <div className='d-flex my-4 align-items-center'>
                      <img 
                        src={board.imgUrl} 
                        alt='' 
                        className='updatePage_img rounded-circle'
                      />
                      <p className='ms-3 mb-0 fs-4'>{board.boardName}</p>

                      <div className='ms-auto pt-1'>
                        <FontAwesomeIcon icon={ faBell } className='updatePage_Bell me-3'/>
                      </div>
                      <button 
                        type="button" 
                        class="btn updatePage_greyButton text-white d-flex justify-content-center"
                        onClick={ () => {handleCancelSubmit(board.id)} }
                      >
                        Tracking
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
            }

            {/* 選項三, 設置 */}
            {selectedMenu === 'setting' && 
              <div className='updatePage_noShadow text-body fw-blod'>
                <h3 className='text-body border-bottom pb-4'>Setting</h3>

                <div className='d-flex py-5 align-items-center justify-content-between border-bottom'>

                      <p className='mb-0 fs-4'>change secret</p>

                      <button onClick={handleShow} className='btn updatePage_greyButton border-0 text-body updatePage_settingButton'>
                        alter
                      </button>

                      <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                          <Modal.Title>change password</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="formPassword" className='mb-4'>
                              <Form.Label>new password</Form.Label>
                              <Form.Control 
                                type="password" 
                                placeholder="enter new password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                              />
                            </Form.Group>

                            <Form.Group controlId="formConfirmPassword" className='mb-4'>
                              <Form.Label>confirm</Form.Label>
                              <Form.Control 
                                type="password" 
                                placeholder="confirm new password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                              />
                            </Form.Group>
                            <div className="d-flex justify-content-end">
                              <button type="submit" className="btn updatePage_greyButton border-0 text-white">
                                save
                              </button>
                            </div>
                          </Form>
                        </Modal.Body>
                      </Modal>

                </div>

                <div className='d-flex py-5 align-items-center justify-content-between border-bottom'>
                  <p className='mb-0 fs-4'>delete</p>
                  <button onClick={() => handleDeleteAccount()} className='btn updatePage_greyButton border-0 text-body updatePage_settingButton'>
                    delete
                  </button>
                </div>
                
              </div>
            }

            {/* 選項4, 贊助 */}
            {selectedMenu === 'donate' && 

              <div className='updatePage_noShadow'>
                <div class="accordion" id="accordionExample">
                  <div class="accordion-item">
                    <h2 class="accordion-header">
                      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                        Donate to This Site
                      </button>
                    </h2>
                    <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                      <div class="accordion-body">
                        <strong>一起支持，讓平台走得更遠！</strong>
                          你的每一份心意，都是讓這個網站持續運作、改善與成長的動力。

                          {/* 金額三選一 */}
                          <div className="mt-3">
                            <label className="form-label">選擇贊助金額：</label>
                            <div className="btn-group" role="group" aria-label="Donation amount">
                              {[50,150,300].map(v=>(
                                <button
                                  key={v}
                                  type="button"
                                  className={`btn ${amount===v ? 'btn-primary' : 'btn-outline-primary'}`}
                                  onClick={()=>handleSelectAmount(v)}
                                >${v}</button>
                              ))}
                            </div>
                          </div>

                          {/* Donate */}
                          <div className="mt-3">
                            <button type="button" className="btn btn-primary text-white" onClick={handleDonate}>
                              Donate
                            </button>
                            <small className="text-muted ms-2">付款成功將導回成功頁。</small>
                          </div>
                      </div>
                    </div>
                  </div>
                  <div class="accordion-item">
                    <h2 class="accordion-header">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                        My Donation History
                      </button>
                    </h2>
                    <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
                      <div class="accordion-body">
                        <strong>此功能開發中，敬請期待</strong> 
                      </div>
                    </div>
                  </div>
                </div>

                
              </div>
              
            }

          </div>


      </div>
    </div>
  );
}

export default UpdateComponent;
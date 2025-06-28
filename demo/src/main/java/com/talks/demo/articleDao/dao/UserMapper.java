package com.talks.demo.articleDao.dao;


import com.talks.demo.articleDao.pojo.*;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface UserMapper {
    //   ----------------- 用戶 -----------------
    @Select("select * from user")
    List<User> getUser();

    //把帳號加入數據庫
    void register(User user);

    //取得用戶資料
    User getUerInformation(String username);

    //修改密碼
    @Select("UPDATE user SET password = #{password} WHERE id = #{userId}")
    void updatePassword(@Param("password") String password, @Param("userId") int userId);

    // 刪除與該用戶相關的文章
    @Delete("DELETE FROM article WHERE user_id = #{userId}")
    void deleteArticles(int userId);

    // 刪除與該用戶相關的訊息
    @Delete("DELETE FROM message WHERE user_id = #{userId}")
    void deleteMessages(int userId);

    // 刪除該用戶收藏的看板
    @Delete("DELETE FROM user_favorite_boards WHERE user_id = #{userId}")
    void deleteUserFavoriteBoards(int userId);

    // 刪除用戶
    @Delete("DELETE FROM user WHERE id = #{userId}")
    void deleteUser(int userId);


    //   ----------------- 文章 -----------------

    // 搜尋關鍵字
    List<Article> searchKeyWord(String keyword);

    //新增文章
    void addArticle(Article article);

    //讀取熱門文章
    @Select("SELECT a.*, u.username, COUNT(m.message_id) as message_count FROM article a \n" +
            "LEFT JOIN user u ON a.user_id = u.id \n" +
            "LEFT JOIN message m ON a.article_id = m.article_id\n" +
            "GROUP BY a.article_id, u.username\n" +
            "ORDER BY a.love DESC LIMIT 40")
    List<ArticleDTO> getHotArticle();

    //讀取最新文章
    @Select("SELECT a.*, u.username, COUNT(m.message_id) as message_count FROM article a \n" +
            "LEFT JOIN user u ON a.user_id = u.id \n" +
            "LEFT JOIN message m ON a.article_id = m.article_id\n" +
            "GROUP BY a.article_id, u.username\n" +
            "ORDER BY a.time DESC LIMIT 40")
    List<ArticleDTO> getNewArticle();

    //更新文章
    @Update("UPDATE article SET title = #{title}, content = #{content} , board_id = #{boardId}, board = #{board} WHERE article_id = #{articleId}")
    void updateArticle(Article article);

    //刪除文章
    @Delete("delete from article where article_id = #{articleId}")
    void deleteArticle(int articleId);

    //取得用戶發的文
    @Select("select a.*, u.username from article a left join user u on a.user_id = u.id where user_id = #{userId}")
    List<ArticleDTO> getArticlesByUserId(int userId);

    //   ----------------- 看板 -----------------

    // 新增收藏看板
    @Insert("insert ignore into user_favorite_boards(user_id, board_id) values(#{userId}, #{boardId})")
    void insertFavoriteBoard(@Param("userId") int userId, @Param("boardId") int boardId);

    // 刪除收藏看板
    @Delete("delete from user_favorite_boards where user_id = #{userId} and board_id = #{boardId}")
    void deleteFavoriteBoard(@Param("userId") int userId, @Param("boardId") int boardId);

    // 查詢收藏看板
    @Select("select board_id from user_favorite_boards where user_id = #{userId}")
    List<Integer> getFavoriteBoardId(@Param("userId") int userId);

    // 查詢追蹤看板的文章
    List<ArticleDTO> getFavBoardArticles(List<Integer> boardIds);

    // 查詢單一看板
    @Select("SELECT a.*, u.username FROM article a left join user u on a.user_id = u.id where a.board=#{boardName} ORDER BY love DESC LIMIT 40;")
    List<ArticleDTO> selectSpecifyBoard(@Param("boardName") String boardName);

    // 用id查詢文章
    @Select("SELECT a.*, u.username, u.avatar FROM article a left join user u on a.user_id = u.id where a.article_id = #{articleId}")
    ArticleDTO selectArticleById(@Param("articleId") int articleId);

    // 取得用戶追蹤看板
    @Select("select b.* from user_favorite_boards uf left join boards b on uf.board_id = b.id where uf.user_id = #{userId}")
    List<Board> getFavoriteBoardInfo(int userId);

    // 取得推薦看板資訊
    @Select("SELECT * FROM boards where recommend = 1")
    List<Board> selectRecommendBoards();

    // 取得所有看板資訊
    @Select("SELECT * FROM boards")
    List<Board> selectAllBoards();

    //   ----------------- 愛心 -----------------
    // 新增愛心數
    @Update("UPDATE article SET love = love + 1 WHERE article_id = #{articleId}")
    int incrementArticleLove(@Param("articleId") int articleId);

    // 減少愛心數
    @Update("UPDATE article SET love = love - 1 WHERE article_id = #{articleId}")
    int decrementArticleLove(@Param("articleId") int articleId);

    //新增留言愛心數
    @Update("UPDATE message SET love = love + 1 WHERE message_id = #{messageId}")
    int incrementMessageLove(@Param("messageId") int messageId);

    //新增留言愛心數
    @Update("UPDATE message SET love = love - 1 WHERE message_id = #{messageId}")
    int decrementMessageLove(@Param("messageId") int messageId);

    //   ----------------- 留言 -----------------

    //新增留言
    @Insert("INSERT INTO message (article_id, user_id, content) VALUES (#{articleId}, #{userId}, #{content})")
    int insertMessage(@Param("articleId") int articleId,
                      @Param("userId") int userId,
                      @Param("content") String content);

    // 查詢留言
    List<Message> selectMessagesByArticleId(@Param("articleId") int articleId);

    // 自動補字
    @Select("SELECT title FROM article " +
            "WHERE title LIKE CONCAT('%', #{keyword}, '%') " +
            "ORDER BY love DESC " +
            "LIMIT 3")
    List<String> suggestTitles(@Param("keyword") String keyword);

    //關鍵字搜尋文章
    @Select("SELECT * FROM article WHERE title LIKE CONCAT('%', #{keyword}, '%') ORDER BY love DESC")
    List<ArticleDTO> searchByTitleKeyword(@Param("keyword") String keyword);
}

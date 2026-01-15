package com.nana.chat_service.repository;
import com.nana.chat_service.model.ChatRoom;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nana.chat_service.model.RoomType;

import java.util.List;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    List<ChatRoom> findByType(RoomType type);
    
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.members m WHERE m.id = :userId")
    List<ChatRoom> findByMemberId(@Param("userId") Long userId);
    
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.creator.id = :userId")
    List<ChatRoom> findByCreatorId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT cr FROM ChatRoom cr " +
           "LEFT JOIN FETCH cr.members " +
           "LEFT JOIN FETCH cr.creator " +
           "WHERE LOWER(cr.name) LIKE LOWER(concat('%', :query, '%')) " +
           "OR LOWER(cr.description) LIKE LOWER(concat('%', :query, '%'))")
    List<ChatRoom> searchRooms(@Param("query") String query);
 
}
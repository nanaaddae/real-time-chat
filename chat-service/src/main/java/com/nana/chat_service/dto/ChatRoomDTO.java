package com.nana.chat_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

import com.nana.chat_service.model.RoomType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomDTO {
    private Long id;
    private String name;
    private String description;
    private RoomType type;
    private String creatorUsername;
    private Set<String> memberUsernames;
    private LocalDateTime createdAt;
    private Boolean hasPassword;
}


package com.nana.chat_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.nana.chat_service.model.MessageType;
import com.nana.chat_service.model.UserStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {
    private Long id;
    private String content;
    private String senderUsername;
    private String senderDisplayName;
    private Long chatRoomId;
    private MessageType type;
    private LocalDateTime timestamp;
    private Boolean deleted;
    private UserStatus senderStatus;
}
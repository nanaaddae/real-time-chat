package com.nana.chat_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.nana.chat_service.dto.ChatMessageDTO;
import com.nana.chat_service.model.MessageType;
import com.nana.chat_service.service.MessageService;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    
    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public ChatMessageDTO sendMessage(
            @DestinationVariable Long roomId,
            @Payload ChatMessageDTO message,
            Principal principal) {
        
        log.info("Received message from {} to room {}: {}", 
                principal.getName(), roomId, message.getContent());
        
        message.setSenderUsername(principal.getName());
        message.setChatRoomId(roomId);
        message.setTimestamp(LocalDateTime.now());
        
        if (message.getType() == MessageType.CHAT) {
            ChatMessageDTO savedMessage = messageService.saveMessage(message, principal.getName());
            return savedMessage;
        }
        
        return message;
    }
    
    @MessageMapping("/chat/{roomId}/typing")
    public void sendTypingNotification(
            @DestinationVariable Long roomId,
            Principal principal) {
        
        ChatMessageDTO typingMessage = ChatMessageDTO.builder()
                .senderUsername(principal.getName())
                .chatRoomId(roomId)
                .type(MessageType.TYPING)
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/typing", 
                typingMessage
        );
    }

    @MessageMapping("/chat/{roomId}/delete/{messageId}")
public void deleteMessage(
        @DestinationVariable Long roomId,
        @DestinationVariable Long messageId,
        Principal principal) {
    
    log.info("Delete message {} in room {} by {}", messageId, roomId, principal.getName());
    
    messageService.deleteMessage(messageId, principal.getName());
    
    // Broadcast deletion to all users in the room
    ChatMessageDTO deletionNotification = ChatMessageDTO.builder()
            .id(messageId)
            .content("[This message has been deleted]")
            .type(MessageType.CHAT)
            .deleted(true)
            .timestamp(LocalDateTime.now())
            .build();
    
    messagingTemplate.convertAndSend(
            "/topic/room/" + roomId + "/delete",
            deletionNotification
    );
}
}
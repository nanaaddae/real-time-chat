package com.nana.chat_service.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.nana.chat_service.dto.ChatMessageDTO;
import com.nana.chat_service.model.MessageType;
import com.nana.chat_service.model.UserStatus;
import com.nana.chat_service.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {
    
    private final SimpMessageSendingOperations messagingTemplate;
    private final UserRepository userRepository;

    @EventListener
public void handleWebSocketConnectListener(SessionConnectedEvent event) {
    StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
    
    // 1. Get the username from the Principal
    if (headerAccessor.getUser() != null) {
        String username = headerAccessor.getUser().getName();
        log.info("User connected: {}", username);

        // 2. CRITICAL: Initialize session attributes if they are null
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes == null) {
            sessionAttributes = new HashMap<>();
        }
        
        // 3. Put the username in and set the attributes back to the accessor
        sessionAttributes.put("username", username);
        headerAccessor.setSessionAttributes(sessionAttributes);

        // 4. Update Database and Broadcast
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setStatus(UserStatus.ONLINE);
            userRepository.save(user);
            
            // This tells everyone else Nana is now Online
            broadcastUserStatus(username, UserStatus.ONLINE);
        });
    } else {
        log.warn("Connect event received but no user principal found!");
    }
}
    
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");
        
        // 1. GLOBAL STATUS UPDATE (Happens regardless of being in a room)
        if (username != null) {
            log.info("User disconnected: {}", username);

            userRepository.findByUsername(username).ifPresent(user -> {
                user.setStatus(UserStatus.OFFLINE);
                // Optional: user.setLastSeen(LocalDateTime.now());
                userRepository.save(user);

                // Broadcast to Global Topic so Tooltips turn gray/offline
                broadcastUserStatus(username, UserStatus.OFFLINE);
            });
        }

        // 2. ROOM-SPECIFIC SYSTEM MESSAGE (Only if they were actually inside a room)
        if (username != null && roomId != null) {
            ChatMessageDTO leaveMessage = ChatMessageDTO.builder()
                    .type(MessageType.LEAVE)
                    .senderUsername(username)
                    .chatRoomId(Long.parseLong(roomId))
                    .timestamp(LocalDateTime.now())
                    .content(username + " left the room")
                    .build();
            
            messagingTemplate.convertAndSend(
                    "/topic/room/" + roomId, 
                    leaveMessage
            );
        }
    }

    private void broadcastUserStatus(String username, UserStatus status) {
        // This matches the subscription in your UserStatusContext.jsx
        messagingTemplate.convertAndSend(
            "/topic/user-status",
            new UserStatusUpdate(username, status)
        );
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class UserStatusUpdate {
        private String username;
        private UserStatus status;
    }
}
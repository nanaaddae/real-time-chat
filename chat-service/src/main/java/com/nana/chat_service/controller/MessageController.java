package com.nana.chat_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.nana.chat_service.dto.ChatMessageDTO;
import com.nana.chat_service.service.MessageService;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MessageController {
    
    private final MessageService messageService;
    
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ChatMessageDTO>> getChatRoomMessages(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "50") int limit) {
        List<ChatMessageDTO> messages = messageService.getChatRoomMessages(roomId, limit);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/room/{roomId}/all")
    public ResponseEntity<List<ChatMessageDTO>> getAllChatRoomMessages(@PathVariable Long roomId) {
        List<ChatMessageDTO> messages = messageService.getAllChatRoomMessages(roomId);
        return ResponseEntity.ok(messages);
    }

    @DeleteMapping("/{messageId}")
public ResponseEntity<Void> deleteMessage(
        @PathVariable Long messageId,
        Authentication authentication) {
    messageService.deleteMessage(messageId, authentication.getName());
    return ResponseEntity.ok().build();
}

}
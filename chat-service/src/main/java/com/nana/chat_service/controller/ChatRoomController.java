package com.nana.chat_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.nana.chat_service.dto.ChatRoomDTO;
import com.nana.chat_service.dto.CreateRoomRequest;
import com.nana.chat_service.dto.JoinRoomRequest;
import com.nana.chat_service.service.ChatRoomService;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ChatRoomController {
    
    private final ChatRoomService chatRoomService;
    
    @PostMapping
    public ResponseEntity<ChatRoomDTO> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            Authentication authentication) {

        ChatRoomDTO room = chatRoomService.createRoom(request, authentication.getName());
        return ResponseEntity.ok(room);
    }
    
    @GetMapping
public ResponseEntity<List<ChatRoomDTO>> getAllRooms(Authentication authentication) {
   
    List<ChatRoomDTO> rooms = chatRoomService.getAllRooms();
    return ResponseEntity.ok(rooms);
}
    
    @GetMapping("/user")
    public ResponseEntity<List<ChatRoomDTO>> getUserRooms(Authentication authentication) {
        List<ChatRoomDTO> rooms = chatRoomService.getUserRooms(authentication.getName());
        return ResponseEntity.ok(rooms);
    }
    
    @GetMapping("/{roomId}")
    public ResponseEntity<ChatRoomDTO> getRoomById(@PathVariable Long roomId) {
        ChatRoomDTO room = chatRoomService.getRoomById(roomId);
        return ResponseEntity.ok(room);
    }
    
  
@PostMapping("/{roomId}/join")
public ResponseEntity<?> joinRoom(
        @PathVariable Long roomId,
        @RequestBody(required = false) JoinRoomRequest request,
        Authentication authentication) {
    try {
        String password = request != null ? request.getPassword() : null;
        chatRoomService.joinRoom(roomId, authentication.getName(), password);
        return ResponseEntity.ok().build();
    } catch (RuntimeException e) {
        return ResponseEntity.status(403).body(e.getMessage());
    }
}
    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable Long roomId,
            Authentication authentication) {
        chatRoomService.leaveRoom(roomId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{roomId}")
public ResponseEntity<Void> deleteRoom(
        @PathVariable Long roomId,
        Authentication authentication) {
    chatRoomService.deleteRoom(roomId, authentication.getName());
    return ResponseEntity.ok().build();
}

@GetMapping("/search")
public ResponseEntity<List<ChatRoomDTO>> searchRooms(@RequestParam String q) {
    return ResponseEntity.ok(chatRoomService.searchRooms(q));
}


}

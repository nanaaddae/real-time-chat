package com.nana.chat_service.service;
import com.nana.chat_service.dto.ChatRoomDTO;
import com.nana.chat_service.dto.CreateRoomRequest;
import  com.nana.chat_service.model.ChatRoom;
import com.nana.chat_service.model.RoomType;
import com.nana.chat_service.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nana.chat_service.model.User;
import com.nana.chat_service.repository.UserRepository;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

        @Autowired
        private PasswordEncoder passwordEncoder; 
    
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public ChatRoomDTO createRoom(CreateRoomRequest request, String username) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ChatRoom chatRoom = ChatRoom.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .creator(creator)
                .members(new HashSet<>())
                .build();

        if (request.getType() == RoomType.PRIVATE && request.getPassword() != null) {
        chatRoom.setPassword(passwordEncoder.encode(request.getPassword()));
    }
        
        chatRoom.getMembers().add(creator);
        chatRoom = chatRoomRepository.save(chatRoom);
        
        return convertToDTO(chatRoom);
    }
    
@Transactional(readOnly = true)
public List<ChatRoomDTO> getAllRooms() {
    List<ChatRoom> rooms = chatRoomRepository.findAll();
    // Force initialization of lazy collections INSIDE the transaction
    rooms.forEach(room -> {
        room.getMembers().size();  // This forces Hibernate to load members
        room.getCreator().getUsername();  // This forces creator load
    });
    
    return rooms.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
}

    @Transactional(readOnly = true)
    public List<ChatRoomDTO> getUserRooms(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return chatRoomRepository.findByMemberId(user.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public ChatRoomDTO getRoomById(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        return convertToDTO(chatRoom);
    }
    
   @Transactional
public void joinRoom(Long roomId, String username, String password) {
    

    ChatRoom chatRoom = chatRoomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Chat room not found"));
    
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

    
    
    // Check if room is private and requires password
    if (chatRoom.getType() == RoomType.PRIVATE && chatRoom.getPassword() != null) {
        // Check if user is already a member (no password needed)
        if (!chatRoom.getMembers().contains(user)) {
            // Validate password
            if (password == null || !passwordEncoder.matches(password, chatRoom.getPassword())) {
                throw new RuntimeException("Incorrect password");
            }
        }
    }
    
    chatRoom.getMembers().add(user);
    chatRoomRepository.save(chatRoom);
}
    
    @Transactional
    public void leaveRoom(Long roomId, String username) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        chatRoom.getMembers().remove(user);
        chatRoomRepository.save(chatRoom);
    }
    
    private ChatRoomDTO convertToDTO(ChatRoom chatRoom) {
        return ChatRoomDTO.builder()
                .id(chatRoom.getId())
                .name(chatRoom.getName())
                .description(chatRoom.getDescription())
                .type(chatRoom.getType())
                .creatorUsername(chatRoom.getCreator().getUsername())
                .memberUsernames(chatRoom.getMembers().stream()
                        .map(User::getUsername)
                        .collect(Collectors.toSet()))
                .createdAt(chatRoom.getCreatedAt())
                .hasPassword(chatRoom.getPassword() != null) 
                .build();
    }

    @Transactional
public void deleteRoom(Long roomId, String username) {
    ChatRoom chatRoom = chatRoomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Chat room not found"));
    
    // Only room creator can delete
    if (!chatRoom.getCreator().getUsername().equals(username)) {
        throw new RuntimeException("Only the room creator can delete this room");
    }
    
    chatRoomRepository.delete(chatRoom);
}

@Transactional(readOnly = true)
    public List<ChatRoomDTO> searchRooms(String query) {
        // If the query is empty or null, just return all rooms 
        // or an empty list depending on your preference.
        if (query == null || query.trim().isEmpty()) {
            return getAllRooms();
        }

        return chatRoomRepository.searchRooms(query).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
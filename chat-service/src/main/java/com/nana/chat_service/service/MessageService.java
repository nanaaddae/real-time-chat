package com.nana.chat_service.service;
import com.nana.chat_service.dto.ChatMessageDTO;
import com.nana.chat_service.model.ChatRoom;
import com.nana.chat_service.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nana.chat_service.model.Message;
import com.nana.chat_service.model.User;
import com.nana.chat_service.repository.MessageRepository;
import com.nana.chat_service.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    
    @Transactional
    public ChatMessageDTO saveMessage(ChatMessageDTO messageDTO, String username) {
        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ChatRoom chatRoom = chatRoomRepository.findById(messageDTO.getChatRoomId())
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        Message message = Message.builder()
                .content(messageDTO.getContent())
                .sender(sender)
                .chatRoom(chatRoom)
                .type(messageDTO.getType())
                .build();
        
        message = messageRepository.save(message);
        
        return convertToDTO(message);
    }
    
    public List<ChatMessageDTO> getChatRoomMessages(Long chatRoomId, int limit) {
        List<Message> messages = messageRepository.findByChatRoomId(
                chatRoomId, 
                PageRequest.of(0, limit)
        );
        
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ChatMessageDTO> getAllChatRoomMessages(Long chatRoomId) {
        List<Message> messages = messageRepository.findByChatRoomIdOrderByTimestampDesc(chatRoomId);
        
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private ChatMessageDTO convertToDTO(Message message) {
        return ChatMessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .senderUsername(message.getSender().getUsername())
                .senderDisplayName(message.getSender().getDisplayName())
                .senderStatus(message.getSender().getStatus())
                .chatRoomId(message.getChatRoom().getId())
                .type(message.getType())
                .timestamp(message.getTimestamp())
                .deleted(message.getDeleted()) 
                .build();
    }


@Transactional
public void deleteMessage(Long messageId, String username) {
    Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Message not found"));
    
    // Only message sender can delete their own messages
    if (!message.getSender().getUsername().equals(username)) {
        throw new RuntimeException("You can only delete your own messages");
    }
    
    message.setDeleted(true);
    message.setDeletedAt(LocalDateTime.now());
    messageRepository.save(message);
}
}

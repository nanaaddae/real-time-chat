package com.nana.chat_service.dto;

import com.nana.chat_service.model.RoomType;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRoomRequest {
    
    @NotBlank(message = "Room name is required")
    private String name;
    
    private String description;
    
    private RoomType type = RoomType.PUBLIC;

    private String password;  
}
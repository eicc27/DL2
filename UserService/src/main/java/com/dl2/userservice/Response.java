package com.dl2.userservice;


import lombok.Data;

@Data
public class Response {
    private Integer code;
    private String msg;
    private Object data;

    public Response(Integer code) {
        this.code = code;
    }

    public Response(Integer code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public Response(Integer code, String msg, Object data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }
}

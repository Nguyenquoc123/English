package com.learning.english.mapper;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.learning.english.dto.request.RefundRequest;
import com.learning.english.dto.response.RefundRequestHistoryResponse;
import com.learning.english.entity.RefundRequestEntity;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RefundRequestMapper {

    @Mapping(source = "course.courseId", target = "courseId")
    @Mapping(source = "course.title", target = "courseTitle")
    @Mapping(source = "course.thumbnailUrl", target = "courseThumbnailUrl")
    @Mapping(source = "course.shortDescription", target = "shortDescription")

    @Mapping(source = "transactionItem.transactionItemId", target = "transactionItemId")
    @Mapping(source = "amount", target = "refundAmount")

    @Mapping(source = "transactionItem.transaction.nameBank", target = "refundBankName")
    @Mapping(source = "transactionItem.transaction.accountBank", target = "refundAccountNumber")
    

    @Mapping(source = "reviewedBy.userId", target = "reviewedById")
    @Mapping(source = "reviewedBy.fullName", target = "reviewedByName")
    RefundRequestHistoryResponse toHistoryResponse(RefundRequestEntity refundRequest);

    List<RefundRequestHistoryResponse> toHistoryResponses(List<RefundRequestEntity> refundRequests);
}

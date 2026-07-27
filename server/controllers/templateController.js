const MessageTemplate = require('../model/MessageTemplate')
const catchAsync = require('../middleware/catchAsync')
const validateObjectId = require('../utils/validateObjectId')
const extractTemplateVariables = require('../utils/extractTemplateVariables')
const compileTemplate = require('../utils/compileTemplate')
const AppError = require('../utils/AppError')

const getTemplates = catchAsync(async (req, res) => {
    const templates = await MessageTemplate.find({ createdBy: req.user._id })
        .sort({ updatedAt: -1 })

    res.status(200).json(templates)
})

const getTemplateById = catchAsync(async (req, res) => {
    validateObjectId(req.params.id, 'Invalid template ID')

    const template = await MessageTemplate.findOne({
        _id: req.params.id,
        createdBy: req.user._id,
    })

    if (!template) {
        throw new AppError('Template not found', 404)
    }

    res.status(200).json(template)
})

const createTemplate = catchAsync(async (req, res) => {
    const { name, description, content } = req.body

    if (!name?.trim()) {
        throw new AppError('Template name is required', 400)
    }

    if (!content?.trim()) {
        throw new AppError('Template content is required', 400)
    }

    const existing = await MessageTemplate.findOne({
        createdBy: req.user._id,
        name: name.trim(),
    })

    if (existing) {
        throw new AppError('You already have a template with this name', 400)
    }

    const template = await MessageTemplate.create({
        name: name.trim(),
        description: description?.trim() || '',
        content: content.trim(),
        variables: extractTemplateVariables(content),
        createdBy: req.user._id,
    })

    res.status(201).json(template)
})

const updateTemplate = catchAsync(async (req, res) => {
    validateObjectId(req.params.id, 'Invalid template ID')

    const template = await MessageTemplate.findOne({
        _id: req.params.id,
        createdBy: req.user._id,
    })

    if (!template) {
        throw new AppError('Template not found', 404)
    }

    const { name, description, content } = req.body

    if (name !== undefined) {
        if (!name.trim()) throw new AppError('Template name is required', 400)

        const duplicate = await MessageTemplate.findOne({
            createdBy: req.user._id,
            name: name.trim(),
            _id: { $ne: template._id },
        })

        if (duplicate) {
            throw new AppError('You already have a template with this name', 400)
        }

        template.name = name.trim()
    }

    if (description !== undefined) {
        template.description = description.trim()
    }

    if (content !== undefined) {
        if (!content.trim()) throw new AppError('Template content is required', 400)
        template.content = content.trim()
        template.variables = extractTemplateVariables(content)
    }

    await template.save()

    res.status(200).json(template)
})

const deleteTemplate = catchAsync(async (req, res) => {
    validateObjectId(req.params.id, 'Invalid template ID')

    const template = await MessageTemplate.findOneAndDelete({
        _id: req.params.id,
        createdBy: req.user._id,
    })

    if (!template) {
        throw new AppError('Template not found', 404)
    }

    res.status(200).json({ message: 'Template deleted', template })
})

const previewTemplate = catchAsync(async (req, res) => {
    const { content, sampleData } = req.body

    if (!content?.trim()) {
        throw new AppError('Template content is required', 400)
    }

    const defaults = {
        name: 'Alex',
        username: 'alexsmith',
        email: 'alex@example.com',
        company: 'Acme Inc',
    }

    const preview = compileTemplate(content, { ...defaults, ...sampleData })
    const variables = extractTemplateVariables(content)

    res.status(200).json({ preview, variables })
})

module.exports = {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    previewTemplate,
}
